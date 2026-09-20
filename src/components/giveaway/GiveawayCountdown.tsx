"use client";

import { useState, useEffect } from "react";

const DEADLINE = new Date("2026-09-30T23:59:59");

function getTimeLeft() {
  const diff = Math.max(0, DEADLINE.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
    expired: diff === 0,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-display text-xl font-semibold tabular-nums leading-none"
        style={{ color: "var(--color-gold)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.55rem] font-medium uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </span>
    </div>
  );
}

export function GiveawayCountdown() {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState(getTimeLeft);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted || t.expired) return null;

  return (
    <div
      className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3"
      style={{
        border: "1px solid rgba(164,121,75,0.22)",
        background: "rgba(164,121,75,0.04)",
      }}
    >
      <p className="text-xs leading-snug text-ink-soft">
        Offerta valida<br />
        <span className="font-medium text-ink">fino al 30 settembre</span>
      </p>

      <div className="flex items-center gap-3">
        <Unit value={t.days}    label="giorni" />
        <span className="mb-3 text-xs text-sand-dark">:</span>
        <Unit value={t.hours}   label="ore" />
        <span className="mb-3 text-xs text-sand-dark">:</span>
        <Unit value={t.minutes} label="min" />
        <span className="mb-3 text-xs text-sand-dark">:</span>
        <Unit value={t.seconds} label="sec" />
      </div>
    </div>
  );
}
