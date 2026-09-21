const WEBHOOK_URL = "https://crm.fusionsoft.it/api/webhooks/incoming/cmuaho41l000201m8x6b4433t";

interface FusionCRMPayload {
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  recipient: {
    firstName: string;
    phone: string;
  };
  order: {
    id: string;
    total: number;
    currency: "EUR";
  };
  giftCard: {
    code: string;
    url: string;
    amount: number;
    message: string;
  };
}

function normalizePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  const trimmed = phone.trim().replace(/\s+/g, "");
  if (!trimmed) return undefined;
  return trimmed.startsWith("+") ? trimmed : `+39${trimmed}`;
}

export interface NotifyFusionCRMInput {
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  recipient: {
    firstName: string;
    phone: string;
  };
  order: {
    id: string;
    total: number;
  };
  giftCard: {
    code: string;
    url: string;
    amount: number;
    message: string;
  };
}

export function notifyFusionCRM(input: NotifyFusionCRMInput): void {
  const webhookUrl = process.env.FUSION_CRM_WEBHOOK_URL ?? WEBHOOK_URL;

  const payload: FusionCRMPayload = {
    buyer: {
      firstName: input.buyer.firstName,
      lastName:  input.buyer.lastName,
      email:     input.buyer.email,
      phone:     normalizePhone(input.buyer.phone),
    },
    recipient: {
      firstName: input.recipient.firstName,
      phone:     normalizePhone(input.recipient.phone) ?? input.recipient.phone,
    },
    order: {
      id:       input.order.id,
      total:    input.order.total,
      currency: "EUR",
    },
    giftCard: {
      code:    input.giftCard.code,
      url:     input.giftCard.url,
      amount:  input.giftCard.amount,
      message: input.giftCard.message,
    },
  };

  fetch(webhookUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[FusionCRM] webhook returned ${res.status}`);
      }
    })
    .catch((err) => console.error("[FusionCRM] webhook error", err));
}
