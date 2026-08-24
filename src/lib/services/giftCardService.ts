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
import { sendGiftCardEmail } from "@/lib/email";

const GIFT_CARD_VALIDITY_MONTHS = 12;
const ORDER_NUMBER_MAX_ATTEMPTS = 5;

export interface FulfillOrderBuyer {
  firstName: string;
  lastName: string;
  email: string;
}

export interface FulfillOrderRecipient {
  recipientName: string;
  recipientEmail: string;
  customMessage?: string | null;
}

export interface FulfillOrderAndCreateGiftCardInput {
  buyer: FulfillOrderBuyer;
  paymentProvider: PaymentProvider;
  transactionId: string;
  recipient: FulfillOrderRecipient;
  amount: number;
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
  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email: input.buyer.email },
      create: {
        firstName: input.buyer.firstName,
        lastName: input.buyer.lastName,
        email: input.buyer.email,
      },
      update: {},
    });

    const order = await createOrderWithUniqueNumber(tx, {
      customerId: customer.id,
      amount: input.amount,
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
        recipientName: input.recipient.recipientName,
        recipientEmail: input.recipient.recipientEmail,
        customMessage: input.recipient.customMessage ?? null,
        amount: input.amount,
        expiresAt,
        scheduledAt: input.scheduledAt ?? null,
        emailSentAt: isScheduled ? null : new Date(),
      },
    });

    return { customer, order, payment, giftCard };
  });

  const giftLink = `${process.env.NEXT_PUBLIC_BASE_URL}/gift/${result.giftCard.secretToken}`;
  const isScheduled =
    result.giftCard.scheduledAt != null && result.giftCard.scheduledAt > new Date();

  if (!isScheduled) {
    await sendGiftCardEmail({
      recipientEmail: result.giftCard.recipientEmail,
      recipientName: result.giftCard.recipientName,
      buyerFullName: `${result.customer.firstName} ${result.customer.lastName}`,
      customMessage: result.giftCard.customMessage,
      amount: input.amount,
      giftLink,
    });
  }

  return result;
}

async function createOrderWithUniqueNumber(
  tx: Prisma.TransactionClient,
  data: { customerId: string; amount: number },
): Promise<Order> {
  for (let attempt = 1; attempt <= ORDER_NUMBER_MAX_ATTEMPTS; attempt++) {
    try {
      return await tx.order.create({
        data: {
          customerId: data.customerId,
          orderNumber: generateOrderNumber(),
          totalAmount: data.amount,
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
