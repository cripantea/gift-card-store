"use server";

import { GiftCardStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createCassaSession,
  clearCassaSession,
  isCassaSessionValid,
  isValidCassaPin,
} from "@/lib/cassaAuth";
import { formatCardCodeGroups, isCompleteCardCode } from "@/lib/utils/cardCode";

// ─── Admin dashboard ──────────────────────────────────────────────────────────

export interface AdminGiftCard {
  id: string;
  cardCode: string;
  recipientName: string;
  recipientEmail: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: GiftCardStatus;
  createdAt: string;
  expiresAt: string;
  redeemedAt: string | null;
  scheduledAt: string | null;
  emailSentAt: string | null;
}

export interface AdminStats {
  totalRevenue: number;
  activeCount: number;
  redeemedCount: number;
  expiredCount: number;
  scheduledCount: number;
  expiringSoonCount: number;
}

export type AdminDashboardResult =
  | { authorized: false }
  | { authorized: true; stats: AdminStats; giftCards: AdminGiftCard[] };

export async function loadAdminDashboard(): Promise<AdminDashboardResult> {
  if (!(await isCassaSessionValid())) {
    return { authorized: false };
  }

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const giftCards = await prisma.giftCard.findMany({
    include: { order: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats: AdminStats = {
    totalRevenue: giftCards.reduce((sum, gc) => sum + gc.amount.toNumber(), 0),
    activeCount: giftCards.filter((gc) => gc.status === GiftCardStatus.ACTIVE && !gc.scheduledAt).length,
    redeemedCount: giftCards.filter((gc) => gc.status === GiftCardStatus.REDEEMED).length,
    expiredCount: giftCards.filter((gc) => gc.status === GiftCardStatus.EXPIRED).length,
    scheduledCount: giftCards.filter((gc) => gc.scheduledAt && !gc.emailSentAt).length,
    expiringSoonCount: giftCards.filter(
      (gc) =>
        gc.status === GiftCardStatus.ACTIVE &&
        gc.expiresAt > now &&
        gc.expiresAt <= in30Days,
    ).length,
  };

  return {
    authorized: true,
    stats,
    giftCards: giftCards.map((gc) => ({
      id: gc.id,
      cardCode: gc.cardCode,
      recipientName: gc.recipientName,
      recipientEmail: gc.recipientEmail,
      buyerName: `${gc.order.customer.firstName} ${gc.order.customer.lastName}`,
      buyerEmail: gc.order.customer.email,
      amount: gc.amount.toNumber(),
      status: gc.status,
      createdAt: gc.createdAt.toISOString(),
      expiresAt: gc.expiresAt.toISOString(),
      redeemedAt: gc.redeemedAt?.toISOString() ?? null,
      scheduledAt: gc.scheduledAt?.toISOString() ?? null,
      emailSentAt: gc.emailSentAt?.toISOString() ?? null,
    })),
  };
}

export interface PinFormState {
  error?: string;
}

export async function verifyCassaPin(
  _prevState: PinFormState,
  formData: FormData,
): Promise<PinFormState> {
  const pin = String(formData.get("pin") ?? "").trim();

  if (!isValidCassaPin(pin)) {
    return { error: "PIN non valido. Riprova." };
  }

  await createCassaSession();
  return {};
}

export async function lockCassa(): Promise<void> {
  await clearCassaSession();
}

export type GiftCardLookupResult =
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "redeemed"; redeemedAt: string }
  | { status: "expired" }
  | {
      status: "active";
      giftCardId: string;
      recipientName: string;
      amount: number;
      cardCode: string;
    };

export async function lookupGiftCardCode(rawCode: string): Promise<GiftCardLookupResult> {
  if (!(await isCassaSessionValid())) {
    return { status: "unauthorized" };
  }

  const cardCode = formatCardCodeGroups(rawCode);
  if (!isCompleteCardCode(cardCode)) {
    return { status: "not_found" };
  }

  const giftCard = await prisma.giftCard.findUnique({ where: { cardCode } });
  if (!giftCard) {
    return { status: "not_found" };
  }

  if (giftCard.status === GiftCardStatus.REDEEMED) {
    return {
      status: "redeemed",
      redeemedAt: (giftCard.redeemedAt ?? giftCard.updatedAt).toISOString(),
    };
  }

  const isPastExpiry = giftCard.expiresAt.getTime() < Date.now();
  if (giftCard.status === GiftCardStatus.EXPIRED || isPastExpiry) {
    if (giftCard.status !== GiftCardStatus.EXPIRED) {
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: GiftCardStatus.EXPIRED },
      });
    }
    return { status: "expired" };
  }

  return {
    status: "active",
    giftCardId: giftCard.id,
    recipientName: giftCard.recipientName,
    amount: giftCard.amount.toNumber(),
    cardCode: giftCard.cardCode,
  };
}

export type RedeemGiftCardResult =
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "already_redeemed"; redeemedAt: string }
  | { status: "expired" }
  | { status: "success"; redeemedAt: string };

export async function confirmGiftCardRedemption(
  giftCardId: string,
): Promise<RedeemGiftCardResult> {
  if (!(await isCassaSessionValid())) {
    return { status: "unauthorized" };
  }

  const giftCard = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!giftCard) {
    return { status: "not_found" };
  }

  if (giftCard.status === GiftCardStatus.REDEEMED) {
    return {
      status: "already_redeemed",
      redeemedAt: (giftCard.redeemedAt ?? giftCard.updatedAt).toISOString(),
    };
  }

  if (giftCard.status === GiftCardStatus.EXPIRED || giftCard.expiresAt.getTime() < Date.now()) {
    return { status: "expired" };
  }

  const redeemedAt = new Date();

  const redeemed = await prisma.$transaction(async (tx) => {
    const { count } = await tx.giftCard.updateMany({
      where: { id: giftCardId, status: GiftCardStatus.ACTIVE },
      data: { status: GiftCardStatus.REDEEMED, redeemedAt },
    });

    if (count === 0) {
      return false;
    }

    await tx.redemptionLog.create({
      data: {
        giftCardId,
        operatorNotes: "Riscattata da Cassa MAD Vigevano",
      },
    });

    return true;
  });

  if (!redeemed) {
    const fresh = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
    return {
      status: "already_redeemed",
      redeemedAt: (fresh?.redeemedAt ?? redeemedAt).toISOString(),
    };
  }

  return { status: "success", redeemedAt: redeemedAt.toISOString() };
}
