import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGiftCardEmail } from "@/lib/email";

export const runtime = "nodejs";

interface CronResult {
  sent: number;
  errors: number;
}

interface ApiErrorResponse {
  error: string;
}

export async function POST(
  request: Request,
): Promise<NextResponse<CronResult | ApiErrorResponse>> {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const now = new Date();

  const pending = await prisma.giftCard.findMany({
    where: {
      emailSentAt: null,
      scheduledAt: { lte: now },
      status: "ACTIVE",
    },
    include: {
      order: { include: { customer: true } },
    },
  });

  let sent = 0;
  let errors = 0;

  for (const giftCard of pending) {
    const giftLink = `${process.env.NEXT_PUBLIC_BASE_URL}/gift/${giftCard.secretToken}`;
    const { customer } = giftCard.order;

    try {
      await sendGiftCardEmail({
        recipientEmail: giftCard.recipientEmail,
        recipientName: giftCard.recipientName,
        buyerFullName: `${customer.firstName} ${customer.lastName}`,
        customMessage: giftCard.customMessage,
        amount: giftCard.amount.toNumber(),
        giftLink,
      });

      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { emailSentAt: now },
      });

      sent++;
    } catch (error) {
      console.error(`Invio email programmato fallito per gift card ${giftCard.id}`, error);
      errors++;
    }
  }

  return NextResponse.json({ sent, errors });
}
