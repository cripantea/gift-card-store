import { Client, Environment, OrdersController } from "@paypal/paypal-server-sdk";
import { z } from "zod";

const globalForPaypal = globalThis as unknown as {
  paypalClient: Client | undefined;
};

function createPaypalClient(): Client {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment:
      process.env.PAYPAL_MODE === "live" ? Environment.Production : Environment.Sandbox,
  });
}

export const paypalClient = globalForPaypal.paypalClient ?? createPaypalClient();

if (process.env.NODE_ENV !== "production") {
  globalForPaypal.paypalClient = paypalClient;
}

export const paypalOrdersController = new OrdersController(paypalClient);

export function getPaypalApiBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPaypalAccessToken(): Promise<string> {
  const token = await paypalClient.clientCredentialsAuthManager.fetchToken();
  return token.accessToken;
}

const verifyWebhookSignatureResponseSchema = z.object({
  verification_status: z.enum(["SUCCESS", "FAILURE"]),
});

export interface VerifyPaypalWebhookSignatureInput {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookEvent: unknown;
}

// The PayPal server SDK does not wrap the `verify-webhook-signature` endpoint,
// so we call PayPal's REST API for it directly, authenticating with the same
// OAuth client-credentials flow the SDK already manages for us.
export async function verifyPaypalWebhookSignature(
  input: VerifyPaypalWebhookSignatureInput,
): Promise<boolean> {
  const accessToken = await getPaypalAccessToken();

  const response = await fetch(
    `${getPaypalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: input.authAlgo,
        cert_url: input.certUrl,
        transmission_id: input.transmissionId,
        transmission_sig: input.transmissionSig,
        transmission_time: input.transmissionTime,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: input.webhookEvent,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const json: unknown = await response.json();
  const parsed = verifyWebhookSignatureResponseSchema.safeParse(json);

  return parsed.success && parsed.data.verification_status === "SUCCESS";
}
