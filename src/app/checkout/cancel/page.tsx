import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-muted text-ink-soft">
        <XCircle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 font-display text-4xl font-semibold text-ink sm:text-5xl">
        Acquisto annullato
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
        Nessun addebito è stato effettuato. Puoi riprovare quando vuoi.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Torna alla home
      </Link>
    </div>
  );
}
