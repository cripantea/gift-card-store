"use client";

import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { GIVEAWAY_ENDS_AT } from "@/lib/giveawayOptions";

const END = new Date(GIVEAWAY_ENDS_AT).getTime();

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Tempo rimasto; null finché non è montato (evita differenze server/client). */
function useRemaining(onEnd?: () => void): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let ended = false;
    function tick() {
      const left = END - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0 && !ended) {
        ended = true;
        onEnd?.();
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onEnd]);

  return remaining;
}

/** Timer grande per la testata della landing. */
export function GiveawayCountdown({ onEnd }: { onEnd?: () => void }) {
  const remaining = useRemaining(onEnd);
  const left = remaining === null ? null : split(remaining);
  const lastHours = remaining !== null && remaining < 24 * 3600 * 1000;

  const units = [
    { label: "giorni", value: left?.days },
    { label: "ore", value: left?.hours },
    { label: "minuti", value: left?.minutes },
    { label: "secondi", value: left?.seconds },
  ];

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border px-4 py-4"
      style={{ borderColor: "rgba(164,121,75,0.3)", background: "rgba(164,121,75,0.05)" }}
    >
      <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
        <Hourglass className="h-3.5 w-3.5" />
        {lastHours ? "Ultime ore" : "Il regalo scade tra"}
      </p>
      <div role="timer" aria-label="Tempo rimasto per ritirare il regalo" className="grid grid-cols-4 gap-2 text-center">
        {units.map(u => (
          <div key={u.label} className="rounded-xl border border-sand-dark bg-white px-1 py-2.5">
            <div className="font-display text-2xl font-semibold tabular-nums leading-none text-ink sm:text-3xl">
              {u.value === undefined ? "––" : pad(u.value)}
            </div>
            <div className="mt-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-ink-soft">{u.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-ink-soft">
        Ritirala entro <span className="font-semibold text-ink">mezzanotte di lunedì 12 ottobre</span>: dopo
        non potrai più richiederla. Una volta ritirata, la tua Gift Card da 50 € è tua e resta{" "}
        <span className="font-semibold text-ink">valida 12 mesi</span>.
      </p>
    </div>
  );
}

/** Promemoria compatto, da mettere accanto al pulsante di invio. */
export function GiveawayCountdownInline() {
  const remaining = useRemaining();
  if (remaining === null) return null;
  const { days, hours, minutes, seconds } = split(remaining);
  const text = days > 0
    ? `${days} ${days === 1 ? "giorno" : "giorni"} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return (
    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
      <Hourglass className="h-3.5 w-3.5 text-gold" />
      Ancora <span className="font-semibold tabular-nums text-ink">{text}</span> per ritirare il tuo regalo
    </p>
  );
}
