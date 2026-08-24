"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { markGiftCardAsOpened } from "@/app/gift/[token]/actions";

const SHAKE_DURATION_MS = 900;
const OPEN_DURATION_MS = 700;

const SPARKLE_POSITIONS: Array<{ top: string; left: string }> = [
  { top: "8%", left: "10%" },
  { top: "20%", left: "78%" },
  { top: "12%", left: "50%" },
];

const RIBBON_GRADIENT = "bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700";

type UnwrapStage = "idle" | "shaking" | "opening" | "revealed";

interface UnwrappingExperienceProps {
  secretToken: string;
  children: ReactNode;
}

export function UnwrappingExperience({ secretToken, children }: UnwrappingExperienceProps) {
  const [stage, setStage] = useState<UnwrapStage>("idle");
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendingTimeouts = timeouts.current;
    return () => {
      pendingTimeouts.forEach(clearTimeout);
    };
  }, []);

  function handleOpen() {
    if (stage !== "idle") {
      return;
    }

    markGiftCardAsOpened(secretToken).catch((error) => {
      console.error("Impossibile registrare l'apertura della Gift Card", error);
    });

    setStage("shaking");
    timeouts.current.push(
      setTimeout(() => setStage("opening"), SHAKE_DURATION_MS),
      setTimeout(() => setStage("revealed"), SHAKE_DURATION_MS + OPEN_DURATION_MS),
    );
  }

  if (stage === "revealed") {
    return <div className="animate-card-reveal">{children}</div>;
  }

  const isOpening = stage === "opening";

  return (
    <div className="flex flex-col items-center gap-8 py-6 text-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.55),transparent_70%)] ${
            isOpening ? "animate-glow-pulse" : "opacity-0"
          }`}
        />

        {SPARKLE_POSITIONS.map((position, index) => (
          <Sparkles
            key={index}
            className={`absolute h-4 w-4 text-gold-soft transition-opacity ${
              isOpening ? "animate-sparkle-float opacity-100" : "opacity-0"
            }`}
            style={{ ...position, animationDelay: `${index * 0.3}s` }}
          />
        ))}

        {/* Box body: opaque white, matching the physical MÀD box finish */}
        <div
          className={`relative flex h-44 w-44 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl ${
            stage === "shaking" ? "animate-box-shake" : ""
          }`}
        >
          {/* Crossed metallic gold ribbon */}
          <div
            className={`absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 shadow-md ${RIBBON_GRADIENT} ${
              isOpening ? "animate-ribbon-melt-v" : ""
            }`}
          />
          <div
            className={`absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 shadow-md ${RIBBON_GRADIENT} ${
              isOpening ? "animate-ribbon-melt-h" : ""
            }`}
          />

          {/* Bow: two loops + a center knot + short tails */}
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
              isOpening ? "animate-bow-melt" : ""
            }`}
          >
            <div className="relative h-10 w-24">
              <span
                className={`absolute right-1/2 top-1/2 h-7 w-12 origin-right -translate-y-1/2 -rotate-[35deg] rounded-[50%] shadow-md ${RIBBON_GRADIENT}`}
              />
              <span
                className={`absolute left-1/2 top-1/2 h-7 w-12 origin-left -translate-y-1/2 rotate-[35deg] rounded-[50%] shadow-md bg-gradient-to-bl from-amber-200 via-yellow-500 to-amber-700`}
              />
              <span className="absolute left-1/2 top-full h-6 w-3 -translate-x-4 rounded-b-sm bg-gradient-to-b from-amber-300 to-amber-700" />
              <span className="absolute left-1/2 top-full h-6 w-3 translate-x-1 rounded-b-sm bg-gradient-to-b from-amber-300 to-amber-700" />
              <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm shadow bg-gradient-to-br from-yellow-300 to-amber-600" />
            </div>
          </div>

          {/* Lid */}
          <div
            className={`absolute -top-3 left-1/2 h-9 w-52 -translate-x-1/2 rounded-2xl border border-neutral-200 bg-neutral-50 shadow-lg ${
              isOpening ? "animate-lid-lift" : ""
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-2xl font-semibold text-ink">Hai ricevuto un regalo</p>
        <p className="max-w-xs text-sm text-ink-soft">
          Qualcuno ha pensato a te con una Gift Card MAD Vigevano.
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpen}
        disabled={stage !== "idle"}
        className="rounded-full bg-ink px-8 py-4 text-base font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        Apri il tuo Regalo
      </button>
    </div>
  );
}
