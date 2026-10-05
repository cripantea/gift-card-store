import { z } from "zod";

export const checkoutRequestSchema = z.object({
  buyer: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(7).max(20),
  }),
  recipient: z.object({
    recipientFirstName: z.string().trim().min(1).max(100),
    recipientLastName: z.string().trim().min(1).max(100),
    recipientPhone: z.string().trim().min(7).max(20),
    customMessage: z.string().trim().max(300).optional(),
  }),
  productSlug: z.string().trim().min(1).max(40),
  // Solo per il prodotto a importo libero.
  customAmount: z.number().positive().max(10_000).optional(),
  discountCode: z.string().trim().max(40).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

// Richiesta inviata alle API di pagamento: il checkout più l'accettazione
// delle condizioni di vendita, con la versione accettata (src/content/legal).
export const checkoutSubmitSchema = checkoutRequestSchema.extend({
  termsAccepted: z.literal(true),
  termsVersion: z.string().trim().min(1).max(20),
});

export type CheckoutSubmit = z.infer<typeof checkoutSubmitSchema>;

export const stripeCheckoutMetadataSchema = z.object({
  buyerFirstName: z.string().min(1),
  buyerLastName: z.string().min(1),
  buyerPhone: z.string().min(1),
  recipientFirstName: z.string().min(1),
  recipientLastName: z.string().min(1),
  recipientPhone: z.string().min(1),
  customMessage: z.string().optional(),
  amount: z.string().min(1),
  scheduledAt: z.string().optional(),
  // Assenti nelle sessioni create prima dei codici sconto.
  productSlug: z.string().optional(),
  faceValue: z.string().optional(),
  discountAmount: z.string().optional(),
  discountCodeId: z.string().optional(),
  discountCode: z.string().optional(),
  // Assenti nelle sessioni create prima del 2026-10-05.
  termsVersion: z.string().optional(),
  termsAcceptedAt: z.string().optional(),
});

export const discountValidateRequestSchema = z.object({
  productSlug: z.string().trim().min(1).max(40),
  customAmount: z.number().positive().max(10_000).optional(),
  discountCode: z.string().trim().min(1).max(40),
});

export type DiscountValidateRequest = z.infer<typeof discountValidateRequestSchema>;

export type StripeCheckoutMetadata = z.infer<typeof stripeCheckoutMetadataSchema>;

export const paypalWebhookEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z.object({
    id: z.string(),
    status: z.string().optional(),
    supplementary_data: z
      .object({
        related_ids: z
          .object({
            order_id: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

export type PaypalWebhookEvent = z.infer<typeof paypalWebhookEventSchema>;
