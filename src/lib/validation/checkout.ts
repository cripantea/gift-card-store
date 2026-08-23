import { z } from "zod";

export const checkoutRequestSchema = z.object({
  buyer: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
  }),
  recipient: z.object({
    recipientName: z.string().trim().min(1).max(100),
    recipientEmail: z.string().trim().email().max(255),
    customMessage: z.string().trim().max(300).optional(),
  }),
  amount: z.number().min(10).max(10_000),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const stripeCheckoutMetadataSchema = z.object({
  buyerFirstName: z.string().min(1),
  buyerLastName: z.string().min(1),
  buyerEmail: z.string().email(),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  customMessage: z.string().optional(),
  amount: z.string().min(1),
});

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
