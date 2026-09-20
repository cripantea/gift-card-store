import { GiveawayForm } from "@/components/giveaway/GiveawayForm";

export const metadata = {
  title: "Un regalo per te — MAD Vigevano",
  description: "Ci conosci già. Adesso vogliamo conoscerti meglio.",
};

export default function GiveawayPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-14 sm:py-20">

      {/* Hero copy */}
      <div className="mb-10 flex w-full max-w-md flex-col gap-3">
        <span
          className="w-fit rounded-full px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em]"
          style={{ background: "rgba(164,121,75,0.09)", color: "var(--color-gold)" }}
        >
          Riservato ai nostri clienti
        </span>

        <h1 className="font-display text-[1.75rem] font-semibold leading-snug text-ink sm:text-3xl">
          Ci conosci già.<br />
          Adesso vogliamo conoscerti meglio.
        </h1>

        <p className="text-sm leading-relaxed text-ink-soft">
          Due minuti per dirci cosa ami di più — così ogni tua visita
          può essere ancora più su misura. In cambio, tieni questo.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md">
        <GiveawayForm />
      </div>

    </div>
  );
}
