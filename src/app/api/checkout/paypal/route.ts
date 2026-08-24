import { NextResponse } from "next/server";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { paypalOrdersController } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { checkoutRequestSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface PaypalCheckoutResponse {
  orderId: string;
}

interface ApiErrorResponse {
  error: string;
}

export async function POST(
  request: Request,
): Promise<NextResponse<PaypalCheckoutResponse | ApiErrorResponse>> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload di checkout non valido." }, { status: 400 });
  }

  const { buyer, recipient, amount, scheduledAt } = parsed.data;

  try {
    const { result: order } = await paypalOrdersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "EUR",
              value: amount.toFixed(2),
            },
            description: `Gift Card per ${recipient.recipientName}`,
          },
        ],
      },
    });

    if (!order.id) {
      return NextResponse.json({ error: "Impossibile creare l'ordine PayPal." }, { status: 502 });
    }

    await prisma.pendingPaypalCheckout.create({
      data: {
        id: order.id,
        buyerFirstName: buyer.firstName,
        buyerLastName: buyer.lastName,
        buyerEmail: buyer.email,
        recipientName: recipient.recipientName,
        recipientEmail: recipient.recipientEmail,
        customMessage: recipient.customMessage ?? null,
        amount,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Errore durante la creazione dell'ordine PayPal", error);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'ordine PayPal." },
      { status: 500 },
    );
  }
}
