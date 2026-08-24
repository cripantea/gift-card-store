import { NextResponse } from "next/server";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { PaymentProvider } from "@/generated/prisma/client";
import { fulfillOrderAndCreateGiftCard } from "@/lib/services/giftCardService";
import { paypalWebhookEventSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface WebhookAck {
  received: boolean;
}

interface ApiErrorResponse {
  error: string;
}

const CAPTURE_COMPLETED_EVENT = "PAYMENT.CAPTURE.COMPLETED";

export async function POST(request: Request): Promise<NextResponse<WebhookAck | ApiErrorResponse>> {
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionSig = request.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: "Header di firma PayPal mancanti." }, { status: 400 });
  }

  const rawBody = await request.text();
  const parsedBody: unknown = JSON.parse(rawBody);

  const isSignatureValid = await verifyPaypalWebhookSignature({
    transmissionId,
    transmissionTime,
    certUrl,
    authAlgo,
    transmissionSig,
    webhookEvent: parsedBody,
  });

  if (!isSignatureValid) {
    console.error("Verifica della firma webhook PayPal fallita");
    return NextResponse.json({ error: "Firma webhook non valida." }, { status: 400 });
  }

  const eventResult = paypalWebhookEventSchema.safeParse(parsedBody);
  if (!eventResult.success) {
    console.error("Payload webhook PayPal non valido", eventResult.error);
    return NextResponse.json({ error: "Payload webhook non valido." }, { status: 400 });
  }

  const event = eventResult.data;

  if (event.event_type === CAPTURE_COMPLETED_EVENT) {
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;

    if (!orderId) {
      console.error("Evento PayPal senza order_id associato", event.id);
      return NextResponse.json({ error: "Ordine PayPal non identificabile." }, { status: 400 });
    }

    const pendingCheckout = await prisma.pendingPaypalCheckout.findUnique({
      where: { id: orderId },
    });

    if (!pendingCheckout) {
      console.error("Nessun checkout PayPal in sospeso trovato per l'ordine", orderId);
      return NextResponse.json({ error: "Checkout PayPal non trovato." }, { status: 404 });
    }

    try {
      await fulfillOrderAndCreateGiftCard({
        buyer: {
          firstName: pendingCheckout.buyerFirstName,
          lastName: pendingCheckout.buyerLastName,
          email: pendingCheckout.buyerEmail,
        },
        paymentProvider: PaymentProvider.PAYPAL,
        transactionId: event.resource.id,
        recipient: {
          recipientName: pendingCheckout.recipientName,
          recipientEmail: pendingCheckout.recipientEmail,
          customMessage: pendingCheckout.customMessage,
        },
        amount: Number(pendingCheckout.amount),
        scheduledAt: pendingCheckout.scheduledAt,
      });

      await prisma.pendingPaypalCheckout.delete({ where: { id: orderId } });
    } catch (error) {
      console.error("Erogazione della Gift Card (PayPal) fallita", error);
      return NextResponse.json({ error: "Erogazione della Gift Card fallita." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
