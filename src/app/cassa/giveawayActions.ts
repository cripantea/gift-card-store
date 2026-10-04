"use server";

import { GiftCardStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isCassaSessionValid } from "@/lib/cassaAuth";

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
}

export type AdminGiveawayResult =
  | { authorized: false }
  | { authorized: true; entries: AdminGiveawayEntry[] };

export async function loadGiveawayEntries(): Promise<AdminGiveawayResult> {
  if (!(await isCassaSessionValid())) {
    return { authorized: false };
  }

  const entries = await prisma.giveawayEntry.findMany({
    include: { giftCard: true },
    orderBy: { createdAt: "desc" },
  });

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
    })),
  };
}
