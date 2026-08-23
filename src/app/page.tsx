import { Sparkles } from "lucide-react";
import { GiftCardCheckout } from "@/components/checkout/GiftCardCheckout";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/50 bg-gold/5 px-4 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Gift Card
          </span>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
            MÀD Vigevano
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Regala un&apos;esperienza di bellezza e benessere esclusiva
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <GiftCardCheckout />
      </main>

      <footer className="border-t border-line py-8">
        <p className="text-center text-xs text-ink-soft/60">
          © {new Date().getFullYear()} MÀD Vigevano — Tutti i diritti riservati
        </p>
      </footer>
    </div>
  );
}
