"use server";

import { cookies, headers } from "next/headers";
import {
  GIVEAWAY_COOKIE,
  GIVEAWAY_COOKIE_MAX_AGE,
  createGiveawayEntry,
  findEntryByEmailAndPhone,
  giveawaySubmissionSchema,
  recordGiveawayVisit,
} from "@/lib/giveaway";

export type SubmitGiveawayResult =
  | { ok: true; secretToken: string }
  | { ok: false; error: string };

/** Ricorda sul telefono che questa persona ha già partecipato. */
async function rememberParticipant(secretToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GIVEAWAY_COOKIE, secretToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GIVEAWAY_COOKIE_MAX_AGE,
  });
}

export async function submitGiveaway(input: unknown): Promise<SubmitGiveawayResult> {
  const parsed = giveawaySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Controlla i dati inseriti." };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? null;

  try {
    const result = await createGiveawayEntry(parsed.data, ip);
    switch (result.status) {
      case "created":
      case "existing":
        await rememberParticipant(result.secretToken);
        return { ok: true, secretToken: result.secretToken };
      case "closed":
        return { ok: false, error: "Il Give Away si è concluso. Grazie di cuore per averci pensato!" };
      case "invalid_phone":
        return { ok: false, error: "Il numero di telefono non sembra valido." };
      case "invalid_email":
        return { ok: false, error: "L'email non sembra valida." };
      case "email_taken":
        return {
          ok: false,
          error: "Questa email ha già partecipato con un altro cellulare. Usa «Hai già partecipato?» qui sotto con il cellulare di allora.",
        };
      case "rate_limited":
        return { ok: false, error: "Troppe richieste da questa connessione. Riprova più tardi." };
    }
  } catch (error) {
    console.error("[Giveaway] creazione gift card fallita", error);
    return { ok: false, error: "Qualcosa è andato storto. Riprova tra qualche istante." };
  }
}

// Limite ai tentativi di "Hai già partecipato?" per IP (in memoria), contro chi
// prova combinazioni email + cellulare a raffica.
const RECOVER_MAX_ATTEMPTS = 10;
const RECOVER_WINDOW_MS = 15 * 60 * 1000;
const recoverAttempts = new Map<string, number[]>();

function isRecoverRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (recoverAttempts.get(ip) ?? []).filter((t) => now - t < RECOVER_WINDOW_MS);
  recent.push(now);
  recoverAttempts.set(ip, recent);
  return recent.length > RECOVER_MAX_ATTEMPTS;
}

/** "Hai già partecipato?": ritrova la partecipazione da email + cellulare (es. da un altro telefono). */
export async function recoverGiveaway(email: string, phone: string): Promise<SubmitGiveawayResult> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  if (isRecoverRateLimited(ip)) {
    return { ok: false, error: "Troppi tentativi. Riprova tra qualche minuto." };
  }

  try {
    const entry = await findEntryByEmailAndPhone(email, phone);
    if (!entry) {
      return { ok: false, error: "Non troviamo una partecipazione con questa email e questo cellulare." };
    }
    await rememberParticipant(entry.giftCard.secretToken);
    return { ok: true, secretToken: entry.giftCard.secretToken };
  } catch (error) {
    console.error("[Giveaway] riconoscimento fallito", error);
    return { ok: false, error: "Qualcosa è andato storto. Riprova tra qualche istante." };
  }
}

export async function trackGiveawayVisit(visitorId: string): Promise<void> {
  try {
    await recordGiveawayVisit(visitorId);
  } catch (error) {
    console.error("[Giveaway] conteggio apertura fallito", error);
  }
}
