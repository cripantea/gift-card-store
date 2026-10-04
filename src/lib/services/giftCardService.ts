import {
  Prisma,
  PaymentStatus,
  OrderStatus,
  type PaymentProvider,
  type Customer,
  type Order,
  type Payment,
  type GiftCard,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateFormattedCardCode, generateSecretToken } from "@/lib/utils/giftCard";
import { generateOrderNumber } from "@/lib/utils/order";
import { notifyFusionCRM } from "@/lib/fusionCrm";
import { findGiftCardProduct, getProductName } from "@/lib/giftCardProducts";
const GIFT_CARD_VALIDITY_MONTHS = 12;
const ORDER_NUMBER_MAX_ATTEMPTS = 5;

export interface FulfillOrderBuyer {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface FulfillOrderRecipient {
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  customMessage?: string | null;
}

export interface FulfillOrderAndCreateGiftCardInput {
  buyer: FulfillOrderBuyer;
  paymentProvider: PaymentProvider;
  transactionId: string;
  recipient: FulfillOrderRecipient;
  /** Importo pagato. */
  amount: number;
  /** Valore della gift card; se assente coincide con l'importo pagato. */
  faceValue?: number;
  productSlug?: string | null;
  discount?: { id: string | null; code: string; amount: number } | null;
  scheduledAt?: Date | null;
}

export interface FulfillOrderAndCreateGiftCardResult {
  customer: Customer;
  order: Order;
  payment: Payment;
  giftCard: GiftCard;
}

export async function fulfillOrderAndCreateGiftCard(
  input: FulfillOrderAndCreateGiftCardInput,
): Promise<FulfillOrderAndCreateGiftCardResult> {
  const faceValue = input.faceValue ?? input.amount;
  const discountAmount = input.discount?.amount ?? 0;

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { phone: input.buyer.phone },
      create: {
        firstName: input.buyer.firstName,
        lastName: input.buyer.lastName,
        phone: input.buyer.phone,
      },
      update: {
        firstName: input.buyer.firstName,
        lastName: input.buyer.lastName,
      },
    });

    // Il cliente ha già pagato: l'utilizzo si registra anche se nel frattempo il
    // codice è stato esaurito o disattivato. Se è stato eliminato resta solo la copia testuale.
    let discountCodeId: string | null = null;
    if (input.discount?.id) {
      const { count } = await tx.discountCode.updateMany({
        where: { id: input.discount.id },
        data: { usedCount: { increment: 1 } },
      });
      discountCodeId = count > 0 ? input.discount.id : null;
    }

    const order = await createOrderWithUniqueNumber(tx, {
      customerId: customer.id,
      amount: input.amount,
      productSlug: input.productSlug ?? null,
      faceValue,
      discountAmount,
      discountCodeId,
      discountCodeText: input.discount?.code ?? null,
    });

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        provider: input.paymentProvider,
        transactionId: input.transactionId,
        amount: input.amount,
        status: PaymentStatus.SUCCEEDED,
      },
    });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + GIFT_CARD_VALIDITY_MONTHS);

    const isScheduled = input.scheduledAt != null && input.scheduledAt > new Date();

    const giftCard = await tx.giftCard.create({
      data: {
        orderId: order.id,
        cardCode: generateFormattedCardCode(),
        secretToken: generateSecretToken(),
        recipientFirstName: input.recipient.recipientFirstName,
        recipientLastName: input.recipient.recipientLastName,
        recipientPhone: input.recipient.recipientPhone,
        customMessage: input.recipient.customMessage ?? null,
        amount: faceValue,
        expiresAt,
        scheduledAt: input.scheduledAt ?? null,
        emailSentAt: isScheduled ? null : new Date(), // marks whatsapp delivery as "queued"
      },
    });

    return { customer, order, payment, giftCard };
  });

  // Al CRM vanno solo i clienti che hanno davvero comprato: niente pagamenti
  // di prova (gc-test). Le risposte del Give Away non passano mai di qui:
  // restano solo nella tab Give Away di /cassa.
  if (isRealPurchase(input.productSlug, input.amount)) notifyFusionCRM({
    buyer: {
      firstName: input.buyer.firstName,
      lastName:  input.buyer.lastName,
      email:     undefined,
      phone:     input.buyer.phone,
    },
    recipient: {
      firstName: input.recipient.recipientFirstName,
      phone:     input.recipient.recipientPhone,
    },
    order: {
      id:             result.order.id,
      number:         result.order.orderNumber,
      total:          input.amount,
      subtotal:       faceValue,
      discountAmount,
      discountCode:   input.discount?.code ?? null,
      product:        input.productSlug ? getProductName(input.productSlug) : `Gift Card ${faceValue} €`,
    },
    giftCard: {
      code:    result.giftCard.cardCode,
      url:     `${process.env.NEXT_PUBLIC_BASE_URL}/gift/${result.giftCard.secretToken}`,
      amount:  faceValue,
      message: input.recipient.customMessage ?? "",
    },
  });

  return result;
}

function isRealPurchase(productSlug: string | null | undefined, amountPaid: number): boolean {
  return amountPaid > 0 && !findGiftCardProduct(productSlug)?.isTest;
}

async function createOrderWithUniqueNumber(
  tx: Prisma.TransactionClient,
  data: {
    customerId: string;
    amount: number;
    productSlug: string | null;
    faceValue: number;
    discountAmount: number;
    discountCodeId: string | null;
    discountCodeText: string | null;
  },
): Promise<Order> {
  for (let attempt = 1; attempt <= ORDER_NUMBER_MAX_ATTEMPTS; attempt++) {
    try {
      return await tx.order.create({
        data: {
          customerId: data.customerId,
          orderNumber: generateOrderNumber(),
          totalAmount: data.amount,
          productSlug: data.productSlug,
          faceValue: data.faceValue,
          discountAmount: data.discountAmount,
          discountCodeId: data.discountCodeId,
          discountCodeText: data.discountCodeText,
          status: OrderStatus.PAID,
        },
      });
    } catch (error) {
      const isOrderNumberCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        (error.meta?.target as string[] | undefined)?.includes("orderNumber");

      if (!isOrderNumberCollision || attempt === ORDER_NUMBER_MAX_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new Error("Impossibile generare un orderNumber univoco.");
}
