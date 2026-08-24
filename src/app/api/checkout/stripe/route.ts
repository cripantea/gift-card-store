import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { checkoutRequestSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

interface ApiErrorResponse {
  error: string;
}

export async function POST(
  request: Request,
): Promise<NextResponse<StripeCheckoutResponse | ApiErrorResponse>> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload di checkout non valido." }, { status: 400 });
  }

  const { buyer, recipient, amount, scheduledAt } = parsed.data;

  const metadata: Stripe.MetadataParam = {
    buyerFirstName: buyer.firstName,
    buyerLastName: buyer.lastName,
    buyerEmail: buyer.email,
    recipientName: recipient.recipientName,
    recipientEmail: recipient.recipientEmail,
    customMessage: recipient.customMessage ?? "",
    amount: amount.toString(),
    scheduledAt: scheduledAt ?? "",
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyer.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Gift Card per ${recipient.recipientName}`,
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      metadata,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossibile creare la sessione di pagamento Stripe." },
        { status: 502 },
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Errore durante la creazione della Stripe Checkout Session", error);
    return NextResponse.json(
      { error: "Errore durante la creazione della sessione di pagamento." },
      { status: 500 },
    );
  }
}
