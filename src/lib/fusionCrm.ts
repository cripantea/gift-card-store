
interface FusionCRMPayload {
  buyer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  recipient: {
    firstName: string;
    phone: string;
  };
  order: {
    id: string;
    number: string;
    /** Importo pagato. */
    total: number;
    /** Testo pronto per i template WhatsApp, es. "90,00 €". */
    totalFormatted: string;
    subtotal: number;
    discountAmount: number;
    /** "nessuno" se non è stato usato un codice: Meta non accetta parametri vuoti. */
    discountCode: string;
    product: string;
    /** Nome e cognome dell'acquirente, per la notifica all'admin. */
    customerName: string;
    currency: "EUR";
  };
  giftCard: {
    code: string;
    url: string;
    amount: number;
    message: string;
  };
}

const NO_DISCOUNT_CODE = "nessuno";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

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
    email?: string | null;
    phone?: string | null;
  };
  recipient: {
    firstName: string;
    phone: string;
  };
  order: {
    id: string;
    number: string;
    total: number;
    subtotal: number;
    discountAmount: number;
    discountCode: string | null;
    product: string;
  };
  giftCard: {
    code: string;
    url: string;
    amount: number;
    message: string;
  };
}

export function notifyFusionCRM(input: NotifyFusionCRMInput): void {
  // L'URL contiene il token segreto dell'endpoint CRM: solo da .env, mai nel
  // codice (il repository è pubblico).
  const webhookUrl = process.env.FUSION_CRM_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("[FusionCRM] FUSION_CRM_WEBHOOK_URL non impostato: ordine non inviato al CRM");
    return;
  }

  const payload: FusionCRMPayload = {
    buyer: {
      firstName: input.buyer.firstName,
      lastName:  input.buyer.lastName,
      email:     input.buyer.email ?? undefined,
      phone:     normalizePhone(input.buyer.phone),
    },
    recipient: {
      firstName: input.recipient.firstName,
      phone:     normalizePhone(input.recipient.phone) ?? input.recipient.phone,
    },
    order: {
      id:             input.order.id,
      number:         input.order.number,
      total:          input.order.total,
      totalFormatted: euro.format(input.order.total).replace(/\u00a0/g, " "),
      subtotal:       input.order.subtotal,
      discountAmount: input.order.discountAmount,
      discountCode:   input.order.discountCode ?? NO_DISCOUNT_CODE,
      product:        input.order.product,
      customerName:   `${input.buyer.firstName} ${input.buyer.lastName}`.trim(),
      currency:       "EUR",
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
