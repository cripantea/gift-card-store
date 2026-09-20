interface FusionCRMPayload {
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  order: {
    id: string;
    orderNumber: string;
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

async function callWebhook(url: string, payload: FusionCRMPayload, label: string): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`[FusionCRM] ${label} webhook returned ${res.status}`);
  }
}

export function notifyFusionCRM(payload: FusionCRMPayload): void {
  const buyerUrl    = process.env.FUSION_CRM_WEBHOOK_URL_BUYER;
  const recipientUrl = process.env.FUSION_CRM_WEBHOOK_URL_RECIPIENT;

  if (buyerUrl) {
    callWebhook(buyerUrl, payload, "buyer").catch(err =>
      console.error("[FusionCRM] buyer webhook error", err),
    );
  }

  if (recipientUrl) {
    callWebhook(recipientUrl, payload, "recipient").catch(err =>
      console.error("[FusionCRM] recipient webhook error", err),
    );
  }
}
