"use server";

import { GiftCardStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isCassaSessionValid } from "@/lib/cassaAuth";

export interface AdminGiveawayEntry {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
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

/** Aperture del link generico /give-away: solo numeri, nessun dato su chi ha aperto. */
export interface AdminGiveawayVisits {
  total: number;
  uniqueVisitors: number;
  today: number;
  last7Days: number;
}

export type AdminGiveawayResult =
  | { authorized: false }
  | { authorized: true; entries: AdminGiveawayEntry[]; visits: AdminGiveawayVisits };

export async function loadGiveawayEntries(): Promise<AdminGiveawayResult> {
  if (!(await isCassaSessionValid())) {
    return { authorized: false };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [entries, total, uniqueRows, today, last7Days] = await Promise.all([
    prisma.giveawayEntry.findMany({
      include: { giftCard: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.giveawayVisit.count(),
    prisma.giveawayVisit.groupBy({ by: ["visitorId"] }),
    prisma.giveawayVisit.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.giveawayVisit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  return {
    authorized: true,
    visits: { total, uniqueVisitors: uniqueRows.length, today, last7Days },
    entries: entries.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      phone: e.phone,
      email: e.email,
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
