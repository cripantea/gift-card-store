import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { stripeCheckoutMetadataSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

interface CheckoutSuccessSearchParams {
  session_id?: string;
  recipientEmail?: string;
}

interface CheckoutSuccessPageProps {
  searchParams: Promise<CheckoutSuccessSearchParams>;
}

async function resolveRecipientEmail(
  params: CheckoutSuccessSearchParams,
): Promise<string | null> {
  if (params.recipientEmail) {
    return params.recipientEmail;
  }

  if (!params.session_id) {
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(params.session_id);
    const metadata = stripeCheckoutMetadataSchema.safeParse(session.metadata ?? {});
    return metadata.success ? metadata.data.recipientEmail : null;
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
  const recipientEmail = await resolveRecipientEmail(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h1 className="mt-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Grazie per il tuo acquisto!
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
        La tua Gift Card MÀD Vigevano è stata acquistata con successo.
      </p>

      {recipientEmail ? (
        <p className="mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-paper-muted px-5 py-3 text-sm text-ink-soft">
          <MailCheck className="h-4 w-4 shrink-0 text-gold" />
          Abbiamo inviato un&apos;email a{" "}
          <strong className="font-medium text-ink">{recipientEmail}</strong> con il
          link per scoprire il regalo!
        </p>
      ) : (
        <p className="mt-6 max-w-md rounded-full border border-line bg-paper-muted px-5 py-3 text-sm text-ink-soft">
          Il destinatario riceverà a breve un&apos;email con il link per scoprire il
          regalo!
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
