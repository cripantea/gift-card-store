import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GIVEAWAY_PRODUCT_SLUG } from "@/lib/giveaway";

export const runtime = "nodejs";

// Tempi di conservazione dichiarati nell'informativa privacy (src/content/legal/privacy.html).
const VISITS_RETENTION_MONTHS = 12;
const GIVEAWAY_RETENTION_MONTHS = 24;
const GIFT_CARD_AFTER_EXPIRY_MONTHS = 24;
const PENDING_PAYPAL_RETENTION_DAYS = 30;

interface RetentionResult {
  visitsDeleted: number;
  pendingPaypalDeleted: number;
  giveawayAnonymized: number;
  giftCardsAnonymized: number;
}

interface ApiErrorResponse {
  error: string;
}

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

/**
 * Cancella o anonimizza i dati oltre i tempi di conservazione. Chiamato una
 * volta al giorno dal crontab del server con Authorization: Bearer CRON_SECRET.
 * I dati contabili di ordini e pagamenti restano (10 anni, art. 2220 c.c.).
 */
export async function POST(
  request: Request,
): Promise<NextResponse<RetentionResult | ApiErrorResponse>> {
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || request.headers.get("Authorization") !== expectedToken) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { count: visitsDeleted } = await prisma.giveawayVisit.deleteMany({
    where: { createdAt: { lt: monthsAgo(VISITS_RETENTION_MONTHS) } },
  });

  const pendingCutoff = new Date(Date.now() - PENDING_PAYPAL_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count: pendingPaypalDeleted } = await prisma.pendingPaypalCheckout.deleteMany({
    where: { createdAt: { lt: pendingCutoff } },
  });

  // Give Away: dopo 24 mesi restano solo i dati statistici non identificativi
  // (come ci ha conosciuto, da quanto, campagna).
  const oldEntries = await prisma.giveawayEntry.findMany({
    where: { anonymizedAt: null, createdAt: { lt: monthsAgo(GIVEAWAY_RETENTION_MONTHS) } },
    include: { giftCard: { include: { order: true } } },
  });
  for (const entry of oldEntries) {
    await prisma.$transaction(async (tx) => {
      await tx.giveawayEntry.update({
        where: { id: entry.id },
        data: {
          firstName: "Anonimo",
          lastName: "",
          phone: `anon-${entry.id}`,
          email: null,
          birthDate: null,
          favoriteServices: Prisma.DbNull,
          note: null,
          sourceOther: null,
          ipHash: null,
          marketingConsent: false,
          anonymizedAt: new Date(),
        },
      });
      await tx.giftCard.update({
        where: { id: entry.giftCardId },
        data: { recipientFirstName: "Anonimo", recipientLastName: "", recipientPhone: "anon", customMessage: null },
      });
      // Il cliente creato solo per il Give Away (nessun acquisto) viene anonimizzato.
      const customerId = entry.giftCard.order.customerId;
      const purchases = await tx.order.count({
        where: { customerId, OR: [{ productSlug: null }, { productSlug: { not: GIVEAWAY_PRODUCT_SLUG } }] },
      });
      if (purchases === 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { firstName: "Anonimo", lastName: "", phone: `anon-${customerId}` },
        });
      }
    });
  }

  // Gift card acquistate: i dati del destinatario si conservano fino a 24 mesi dopo la scadenza.
  const { count: giftCardsAnonymized } = await prisma.giftCard.updateMany({
    where: {
      expiresAt: { lt: monthsAgo(GIFT_CARD_AFTER_EXPIRY_MONTHS) },
      recipientPhone: { not: "anon" },
      order: { OR: [{ productSlug: null }, { productSlug: { not: GIVEAWAY_PRODUCT_SLUG } }] },
    },
    data: { recipientFirstName: "Anonimo", recipientLastName: "", recipientPhone: "anon", customMessage: null },
  });

  return NextResponse.json({
    visitsDeleted,
    pendingPaypalDeleted,
    giveawayAnonymized: oldEntries.length,
    giftCardsAnonymized,
  });
}
