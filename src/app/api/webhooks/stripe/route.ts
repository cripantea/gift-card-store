import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { PaymentProvider } from "@/generated/prisma/client";
import { fulfillOrderAndCreateGiftCard } from "@/lib/services/giftCardService";
import { stripeCheckoutMetadataSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface WebhookAck {
  received: boolean;
}

interface ApiErrorResponse {
  error: string;
}

export async function POST(request: Request): Promise<NextResponse<WebhookAck | ApiErrorResponse>> {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Firma Stripe mancante." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Verifica della firma webhook Stripe fallita", error);
    return NextResponse.json({ error: "Firma webhook non valida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const metadataResult = stripeCheckoutMetadataSchema.safeParse(session.metadata ?? {});
    if (!metadataResult.success) {
      console.error("Metadata della Stripe Checkout Session non valida", metadataResult.error);
      return NextResponse.json({ error: "Metadata della sessione non valida." }, { status: 400 });
    }

    const metadata = metadataResult.data;
    const transactionId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.id;

    try {
      await fulfillOrderAndCreateGiftCard({
        buyer: {
          firstName: metadata.buyerFirstName,
          lastName: metadata.buyerLastName,
          email: metadata.buyerEmail,
        },
        paymentProvider: PaymentProvider.STRIPE,
        transactionId,
        recipient: {
          recipientName: metadata.recipientName,
          recipientEmail: metadata.recipientEmail,
          customMessage: metadata.customMessage || null,
        },
        amount: Number(metadata.amount),
      });
    } catch (error) {
      console.error("Erogazione della Gift Card (Stripe) fallita", error);
      return NextResponse.json({ error: "Erogazione della Gift Card fallita." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
