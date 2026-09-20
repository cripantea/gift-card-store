import { GiveawayForm } from "@/components/giveaway/GiveawayForm";

export const metadata = {
  title: "Un regalo per te — MAD Vigevano",
  description: "Prima ancora di incontrarci, vogliamo già conoscerti.",
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
          Solo per te
        </span>

        <h1 className="font-display text-[1.75rem] font-semibold leading-snug text-ink sm:text-3xl">
          Prima ancora di incontrarci,<br />
          vogliamo già conoscerti.
        </h1>

        <p className="text-sm leading-relaxed text-ink-soft">
          Dicci qualcosa di te — ci aiuta a prepararti l&apos;esperienza giusta
          fin dal primo appuntamento. E nel frattempo, c&apos;è un piccolo regalo
          che ti aspetta.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md">
        <GiveawayForm />
      </div>

    </div>
  );
}
