import { Resend } from "resend";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

export const resend = globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY);

if (process.env.NODE_ENV !== "production") {
  globalForResend.resend = resend;
}

export interface SendGiftCardEmailInput {
  recipientEmail: string;
  recipientName: string;
  buyerFullName: string;
  customMessage: string | null;
  amount: number;
  giftLink: string;
}

export async function sendGiftCardEmail(input: SendGiftCardEmailInput): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(input.amount);

  const messageBlock = input.customMessage
    ? `<p style="font-size:16px;line-height:1.5;color:#333;white-space:pre-wrap;">${escapeHtml(
        input.customMessage,
      )}</p>`
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h1 style="font-size:22px;color:#111;">Hai ricevuto una Gift Card!</h1>
      <p style="font-size:16px;color:#333;">Ciao ${escapeHtml(input.recipientName)},</p>
      <p style="font-size:16px;color:#333;">
        ${escapeHtml(input.buyerFullName)} ti ha inviato una Gift Card da <strong>${formattedAmount}</strong>.
      </p>
      ${messageBlock}
      <p style="margin:32px 0;">
        <a href="${input.giftLink}" style="background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:16px;">
          Scopri la tua Gift Card
        </a>
      </p>
      <p style="font-size:13px;color:#888;">Se il bottone non funziona, copia e incolla questo link nel browser:<br/>${input.giftLink}</p>
    </div>
  `;

  const text = [
    `Ciao ${input.recipientName},`,
    `${input.buyerFullName} ti ha inviato una Gift Card da ${formattedAmount}.`,
    input.customMessage ?? "",
    `Scopri la tua Gift Card: ${input.giftLink}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: input.recipientEmail,
    subject: `${input.buyerFullName} ti ha inviato una Gift Card`,
    html,
    text,
  });

  if (error) {
    throw new Error(`Invio email Gift Card fallito: ${error.message}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
