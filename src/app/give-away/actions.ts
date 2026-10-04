"use server";

import { headers } from "next/headers";
import { createGiveawayEntry, giveawaySubmissionSchema } from "@/lib/giveaway";

export type SubmitGiveawayResult =
  | { ok: true; secretToken: string }
  | { ok: false; error: string };

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
        return { ok: true, secretToken: result.secretToken };
      case "closed":
        return { ok: false, error: "Il Give Away si è concluso. Grazie di cuore per averci pensato!" };
      case "invalid_phone":
        return { ok: false, error: "Il numero di telefono non sembra valido." };
      case "rate_limited":
        return { ok: false, error: "Troppe richieste da questa connessione. Riprova più tardi." };
    }
  } catch (error) {
    console.error("[Giveaway] creazione gift card fallita", error);
    return { ok: false, error: "Qualcosa è andato storto. Riprova tra qualche istante." };
  }
}
