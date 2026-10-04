"use server";

import { GiftCardStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isCassaSessionValid } from "@/lib/cassaAuth";
import { generateInviteCode, normalizeGiveawayPhone } from "@/lib/giveaway";

export interface AdminGiveawayEntry {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  source: string;
  sourceOther: string | null;
  knownSince: string;
  birthDate: string | null;
  favoriteServices: string[];
  note: string | null;
  marketingConsent: boolean;
  campaign: string | null;
  createdAt: string;
  cardCode: string;
  cardStatus: GiftCardStatus;
  cardOpened: boolean;
  /** Persona dell'invito personale da cui ha risposto, se c'è. */
  inviteName: string | null;
  inviteCode: string | null;
}

export interface AdminGiveawayInvite {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  clickCount: number;
  firstClickedAt: string | null;
  lastClickedAt: string | null;
  createdAt: string;
  /** Id delle risposte arrivate da questo link (di solito una). */
  entryIds: string[];
}

export type AdminGiveawayResult =
  | { authorized: false }
  | { authorized: true; entries: AdminGiveawayEntry[]; invites: AdminGiveawayInvite[] };

export async function loadGiveawayEntries(): Promise<AdminGiveawayResult> {
  if (!(await isCassaSessionValid())) {
    return { authorized: false };
  }

  const [entries, invites] = await Promise.all([
    prisma.giveawayEntry.findMany({
      include: { giftCard: true, invite: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.giveawayInvite.findMany({
      include: { entries: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    authorized: true,
    entries: entries.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      phone: e.phone,
      source: e.source,
      sourceOther: e.sourceOther,
      knownSince: e.knownSince,
      birthDate: e.birthDate ? e.birthDate.toISOString().slice(0, 10) : null,
      favoriteServices: Array.isArray(e.favoriteServices)
        ? e.favoriteServices.filter((v): v is string => typeof v === "string")
        : [],
      note: e.note,
      marketingConsent: e.marketingConsent,
      campaign: e.campaign,
      createdAt: e.createdAt.toISOString(),
      cardCode: e.giftCard.cardCode,
      cardStatus: e.giftCard.status,
      cardOpened: e.giftCard.isOpened,
      inviteName: e.invite?.name ?? null,
      inviteCode: e.invite?.code ?? null,
    })),
    invites: invites.map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      phone: i.phone,
      clickCount: i.clickCount,
      firstClickedAt: i.firstClickedAt?.toISOString() ?? null,
      lastClickedAt: i.lastClickedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
      entryIds: i.entries.map((e) => e.id),
    })),
  };
}

export type CreateInvitesResult =
  | { status: "unauthorized" }
  | { status: "ok"; created: number; skipped: string[] };

/**
 * Crea un link personale per ogni riga "Nome Cognome, telefono" (telefono
 * facoltativo, separato da virgola, punto e virgola o tab).
 */
export async function createGiveawayInvites(text: string): Promise<CreateInvitesResult> {
  if (!(await isCassaSessionValid())) return { status: "unauthorized" };

  const skipped: string[] = [];
  let created = 0;

  for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 500)) {
    const [rawName, rawPhone] = line.split(/[,;\t]/).map((p) => p.trim());
    const name = (rawName ?? "").slice(0, 100);
    const phone = rawPhone ? normalizeGiveawayPhone(rawPhone) : null;
    if (!name || (rawPhone && !phone)) {
      skipped.push(line);
      continue;
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await prisma.giveawayInvite.create({ data: { code: generateInviteCode(), name, phone } });
        created++;
        break;
      } catch (error) {
        const isCodeCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!isCodeCollision || attempt === 4) throw error;
      }
    }
  }

  return { status: "ok", created, skipped };
}

export async function deleteGiveawayInvite(id: string): Promise<{ ok: boolean }> {
  if (!(await isCassaSessionValid())) return { ok: false };
  // Le risposte già arrivate restano: perdono solo il collegamento (onDelete: SetNull).
  await prisma.giveawayInvite.delete({ where: { id } }).catch(() => null);
  return { ok: true };
}
