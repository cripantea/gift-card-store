import { createHash } from "crypto";
import { z } from "zod";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateFormattedCardCode, generateSecretToken } from "@/lib/utils/giftCard";
import {
  GIVEAWAY_KNOWN_SINCE,
  GIVEAWAY_MARKETING_CONSENT_TEXT,
  GIVEAWAY_MIN_AGE,
  GIVEAWAY_SERVICES,
  GIVEAWAY_SOURCES,
} from "@/lib/giveawayOptions";
import { LEGAL_VERSION } from "@/lib/company";

export const GIVEAWAY_PRODUCT_SLUG = "giveaway";
export const GIVEAWAY_AMOUNT = 50;
const GIVEAWAY_VALIDITY_MONTHS = 12;
/** Oltre questo numero di partecipazioni nelle 24h dallo stesso IP il form si blocca. */
const MAX_ENTRIES_PER_IP_PER_DAY = 5;
/** Dedica stampata sulla card (la frase di ringraziamento compare già all'apertura). */
const GIVEAWAY_CARD_MESSAGE = "Un piccolo grazie per ogni volta che ci hai scelto. Ti aspettiamo in salone!";

/** Fine del Give Away (GIVEAWAY_ENDS_AT, ISO): senza variabile resta aperto. */
export function isGiveawayOpen(now: Date = new Date()): boolean {
  const endsAt = process.env.GIVEAWAY_ENDS_AT;
  if (!endsAt) return true;
  const end = new Date(endsAt);
  return Number.isNaN(end.getTime()) || now <= end;
}

/** "+39 333 123 4567", "3331234567", "0039…" → "+393331234567"; null se non plausibile. */
export function normalizeGiveawayPhone(raw: string): string | null {
  let phone = raw.trim().replace(/[\s\-./()]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (!phone.startsWith("+")) phone = `+39${phone}`;
  return /^\+\d{8,15}$/.test(phone) ? phone : null;
}

export function sanitizeCampaign(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return value || null;
}

/** Cookie che ricorda sul telefono chi ha già partecipato (contiene il token della sua gift card). */
export const GIVEAWAY_COOKIE = "mad_giveaway";
export const GIVEAWAY_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function normalizeGiveawayEmail(raw: string | null | undefined): string | null {
  const email = raw?.trim().toLowerCase() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 ? email : null;
}

/** Partecipante già registrato a partire dal token della sua gift card (cookie). */
export async function findEntryBySecretToken(token: string | null | undefined) {
  if (!token || !/^[a-f0-9]{32}$/.test(token)) return null;
  return prisma.giveawayEntry.findFirst({
    where: { giftCard: { secretToken: token } },
    include: { giftCard: true },
  });
}

/**
 * Riconoscimento manuale (es. da un altro telefono): serve l'email usata nel
 * form più il cellulare, così nessuno ottiene la card di un altro solo
 * conoscendone l'email.
 */
export async function findEntryByEmailAndPhone(rawEmail: string, rawPhone: string) {
  const email = normalizeGiveawayEmail(rawEmail);
  const phone = normalizeGiveawayPhone(rawPhone);
  if (!email || !phone) return null;
  return prisma.giveawayEntry.findFirst({ where: { email, phone }, include: { giftCard: true } });
}

/** Conta un'apertura della pagina. Chiamata dal browser, così le anteprime di WhatsApp non contano. */
export async function recordGiveawayVisit(rawVisitorId: string): Promise<void> {
  const visitorId = rawVisitorId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || "anonimo";
  await prisma.giveawayVisit.create({ data: { visitorId } });
}

function isAdult(birthDate: string): boolean {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age >= GIVEAWAY_MIN_AGE && age < 120;
}

export const giveawaySubmissionSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(6).max(25),
    email: z.string().trim().toLowerCase().email("L'email non sembra valida").max(200),
    source: z.enum(GIVEAWAY_SOURCES),
    sourceOther: z.string().trim().max(200).optional(),
    knownSince: z.enum(GIVEAWAY_KNOWN_SINCE),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica la data di nascita"),
    favoriteServices: z
      .array(z.string().refine((v) => GIVEAWAY_SERVICES.includes(v)))
      .min(1, "Scegli almeno un trattamento")
      .max(GIVEAWAY_SERVICES.length),
    note: z.string().trim().max(1000).optional(),
    marketingConsent: z.boolean(),
    privacyConsent: z.literal(true),
    campaign: z.string().max(100).optional(),
  })
  .refine((data) => isAdult(data.birthDate), {
    path: ["birthDate"],
    message: `Il Give Away è riservato ai maggiorenni (${GIVEAWAY_MIN_AGE} anni compiuti).`,
  })
  .refine((data) => data.source !== "Altro" || !!data.sourceOther, {
    path: ["sourceOther"],
    message: "Dicci dove ci hai conosciuto",
  });

export type GiveawaySubmission = z.infer<typeof giveawaySubmissionSchema>;

export type GiveawayResult =
  | { status: "created" | "existing"; secretToken: string }
  | { status: "closed" | "invalid_phone" | "invalid_email" | "email_taken" | "rate_limited" };

function hashIp(ip: string | null): string | null {
  return ip ? createHash("sha256").update(`mad-giveaway:${ip}`).digest("hex") : null;
}

/**
 * Registra la risposta e crea una gift card reale da 50 € (ordine a 0 €,
 * riscattabile in cassa come le altre). Un numero di telefono = una card:
 * se il numero ha già partecipato si restituisce la card esistente.
 * Volutamente NON notifica il CRM: i dati del Give Away restano nello shop
 * (tab Give Away di /cassa); al CRM vanno solo gli acquisti pagati.
 */
export async function createGiveawayEntry(
  input: GiveawaySubmission,
  ip: string | null,
): Promise<GiveawayResult> {
  if (!isGiveawayOpen()) return { status: "closed" };

  const phone = normalizeGiveawayPhone(input.phone);
  if (!phone) return { status: "invalid_phone" };

  const email = normalizeGiveawayEmail(input.email);

  if (!email) return { status: "invalid_email" };

  // Ha già partecipato con questo cellulare: stessa gift card, nessun doppione.
  const existing = await prisma.giveawayEntry.findUnique({ where: { phone }, include: { giftCard: true } });
  if (existing) {
    if (!existing.email) await prisma.giveawayEntry.update({ where: { id: existing.id }, data: { email } }).catch(() => null);
    return { status: "existing", secretToken: existing.giftCard.secretToken };
  }
  // Email già usata con un altro cellulare: non riveliamo la card di qualcun altro.
  if (await prisma.giveawayEntry.findUnique({ where: { email } })) return { status: "email_taken" };

  const ipHash = hashIp(ip);
  if (ipHash) {
    const recent = await prisma.giveawayEntry.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    if (recent >= MAX_ENTRIES_PER_IP_PER_DAY) return { status: "rate_limited" };
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + GIVEAWAY_VALIDITY_MONTHS);

  try {
    const giftCard = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone },
        create: { firstName: input.firstName, lastName: input.lastName, phone },
        update: {},
      });

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          orderNumber: `GIVE-${new Date().getFullYear()}-${generateSecretToken().slice(0, 8).toUpperCase()}`,
          totalAmount: 0,
          productSlug: GIVEAWAY_PRODUCT_SLUG,
          faceValue: GIVEAWAY_AMOUNT,
          status: OrderStatus.PAID,
        },
      });

      const card = await tx.giftCard.create({
        data: {
          orderId: order.id,
          cardCode: generateFormattedCardCode(),
          secretToken: generateSecretToken(),
          recipientFirstName: input.firstName,
          recipientLastName: input.lastName,
          recipientPhone: phone,
          customMessage: GIVEAWAY_CARD_MESSAGE,
          amount: GIVEAWAY_AMOUNT,
          expiresAt,
          emailSentAt: new Date(),
        },
      });

      await tx.giveawayEntry.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone,
          source: input.source,
          sourceOther: input.source === "Altro" ? input.sourceOther ?? null : null,
          knownSince: input.knownSince,
          birthDate: new Date(`${input.birthDate}T00:00:00Z`),
          favoriteServices: input.favoriteServices,
          note: input.note || null,
          marketingConsent: input.marketingConsent,
          marketingConsentAt: input.marketingConsent ? new Date() : null,
          marketingConsentText: input.marketingConsent ? GIVEAWAY_MARKETING_CONSENT_TEXT : null,
          termsVersion: LEGAL_VERSION,
          termsAcceptedAt: new Date(),
          campaign: sanitizeCampaign(input.campaign),
          ipHash,
          email,
          giftCardId: card.id,
        },
      });

      return card;
    });

    return { status: "created", secretToken: giftCard.secretToken };
  } catch (error) {
    // Doppio invio in parallelo dallo stesso numero: vince il primo.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const entry = await prisma.giveawayEntry.findUnique({ where: { phone }, include: { giftCard: true } });
      if (entry) return { status: "existing", secretToken: entry.giftCard.secretToken };
    }
    throw error;
  }
}
