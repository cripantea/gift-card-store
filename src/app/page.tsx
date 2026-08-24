import { GiftCardCheckout } from "@/components/checkout/GiftCardCheckout";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <section className="border-b border-line/60">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:py-20">
          <div className="flex items-center gap-2.5">
            <span className="block h-px w-8 bg-gold-soft/60" />
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-gold">
              Gift Card
            </span>
            <span className="block h-px w-8 bg-gold-soft/60" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Regala un&apos;esperienza esclusiva
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            Scegli il valore della tua Gift Card MÀD Vigevano. Il destinatario
            riceverà un&apos;email con il codice per prenotare il suo trattamento.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 sm:py-16">
        <GiftCardCheckout />
      </main>

      <footer className="border-t border-line/60 py-8">
        <p className="text-center text-[0.7rem] uppercase tracking-[0.15em] text-ink-soft/50">
          © {new Date().getFullYear()} MÀD Vigevano
        </p>
      </footer>
    </div>
  );
}
