import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface CronResult {
  processed: number;
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
  });

  let processed = 0;
  let errors = 0;

  for (const giftCard of pending) {
    try {
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { emailSentAt: now },
      });
      processed++;
    } catch (error) {
      console.error(`Aggiornamento scheduledAt fallito per gift card ${giftCard.id}`, error);
      errors++;
    }
  }

  return NextResponse.json({ processed, errors });
}
