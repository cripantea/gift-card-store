import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import { GIVEAWAY_THANK_YOU } from "@/lib/giveawayOptions";

/** Chi ha già compilato il form e riapre /give-away: niente form, direttamente il suo regalo. */
export function GiveawayWelcomeBack({ firstName, secretToken }: { firstName: string; secretToken: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/50 bg-gold/5 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
          <Sparkles className="h-3 w-3" />
          Ma è solo per te
        </span>
        <h1 className="font-display text-[1.9rem] font-semibold leading-tight text-ink">Bentornata/o, {firstName}!</h1>
        <p className="font-display text-xl italic leading-snug text-gold">{GIVEAWAY_THANK_YOU}</p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Hai già partecipato: la tua Gift Card da 50 € è pronta e ti aspetta, non devi compilare niente.
        </p>

        <Link
          href={`/gift/${secretToken}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-paper transition-all hover:bg-ink/85 active:scale-[0.98]"
        >
          <Gift className="h-4 w-4" />
          Apri la tua Gift Card da 50 €
        </Link>
        <Link
          href="/?prodotto=gc-50"
          className="w-full rounded-xl border border-sand-dark py-3 text-sm font-medium text-ink transition-colors hover:border-gold"
        >
          Vuoi farne una a qualcuno? Regala una Gift Card da 50 €
        </Link>
      </div>
    </div>
  );
}
