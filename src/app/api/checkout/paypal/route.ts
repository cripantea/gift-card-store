import { NextResponse } from "next/server";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { paypalOrdersController } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { checkoutSubmitSchema } from "@/lib/validation/checkout";
import { quoteCheckout } from "@/lib/services/discountService";

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
  const parsed = checkoutSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi o condizioni di vendita non accettate." },
      { status: 400 },
    );
  }

  const { buyer, recipient, scheduledAt } = parsed.data;

  const quoteResult = await quoteCheckout(parsed.data);
  if (!quoteResult.ok) {
    return NextResponse.json({ error: quoteResult.error }, { status: 400 });
  }
  const { quote } = quoteResult;
  const amount = quote.total;

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
            description: `Gift Card per ${recipient.recipientFirstName} ${recipient.recipientLastName}`,
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
        buyerPhone: buyer.phone,
        recipientFirstName: recipient.recipientFirstName,
        recipientLastName: recipient.recipientLastName,
        recipientPhone: recipient.recipientPhone,
        customMessage: recipient.customMessage ?? null,
        amount,
        productSlug: quote.product.slug,
        faceValue: quote.faceValue,
        discountAmount: quote.discountAmount,
        discountCodeId: quote.discount?.id ?? null,
        discountCodeText: quote.discount?.code ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        termsVersion: parsed.data.termsVersion,
        termsAcceptedAt: new Date(),
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
