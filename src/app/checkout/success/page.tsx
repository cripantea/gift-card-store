import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { stripeCheckoutMetadataSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface CheckoutSuccessSearchParams {
  session_id?: string;
  recipientPhone?: string;
}

interface CheckoutSuccessPageProps {
  searchParams: Promise<CheckoutSuccessSearchParams>;
}

async function resolveRecipientPhone(
  params: CheckoutSuccessSearchParams,
): Promise<string | null> {
  if (params.recipientPhone) {
    return params.recipientPhone;
  }

  if (!params.session_id) {
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(params.session_id);
    const metadata = stripeCheckoutMetadataSchema.safeParse(session.metadata ?? {});
    return metadata.success ? metadata.data.recipientPhone : null;
  } catch (error) {
    console.error(
      "Impossibile recuperare la sessione Stripe per la pagina di conferma",
      error,
    );
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const recipientPhone = await resolveRecipientPhone(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h1 className="mt-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Grazie per il tuo acquisto!
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
        La tua Gift Card MAD Vigevano è stata acquistata con successo.
      </p>

      {recipientPhone ? (
        <p className="mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-paper-muted px-5 py-3 text-sm text-ink-soft">
          <MessageCircle className="h-4 w-4 shrink-0 text-gold" />
          Il destinatario riceverà un WhatsApp al numero{" "}
          <strong className="font-medium text-ink">{recipientPhone}</strong> direttamente
          da MAD for Hair.
        </p>
      ) : (
        <p className="mt-6 max-w-md rounded-full border border-line bg-paper-muted px-5 py-3 text-sm text-ink-soft">
          Il destinatario riceverà a breve un WhatsApp da MAD for Hair con il link per
          scoprire il regalo!
        </p>
      )}

      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Torna alla home
      </Link>
    </div>
  );
}
