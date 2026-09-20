"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";
import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";
import { CardScene } from "@/components/gift/CardScene";

/* ─── Servizi reali MAD Vigevano ──────────────────────────────────────── */
const SERVIZI = [
  "Taglio sartoriale",
  "Piega & Styling",
  "Colorazioni organiche",
  "Airtouch & Balayage",
  "Trattamenti curativi",
  "OXY Hair Spa",
  "Preparazione sposa",
  "Preparazione shooting",
];

/* ─── Confetti ────────────────────────────────────────────────────────── */
const CONFETTI = Array.from({ length: 52 }, (_, i) => {
  const angle = (i / 52) * 360 + (i % 7) * 14;
  const r = 70 + (i % 11) * 26;
  return {
    id: i,
    x: Math.cos((angle * Math.PI) / 180) * r,
    y: Math.sin((angle * Math.PI) / 180) * r - 50,
    rotate: (i % 2 === 0 ? 1 : -1) * (100 + (i % 6) * 55),
    color: ["#f6c453", "#fde9a8", "#c3a06a", "#a4794b", "#e8d48a", "#ffffff", "#f0d060"][i % 7],
    w: 7 + (i % 4) * 2.5,
    h: 3.5 + (i % 3),
    delay: (i % 16) * 0.032,
  };
});

/* ─── Multi-select dropdown ───────────────────────────────────────────── */
function ServiziSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  }
  function remove(v: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(selected.filter(s => s !== v));
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex min-h-[48px] w-full items-start gap-2 rounded-xl border border-sand-dark bg-white px-4 py-2.5 text-left transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
      >
        <div className="flex flex-1 flex-wrap gap-1.5 py-0.5">
          {selected.length === 0 ? (
            <span className="text-sm text-neutral-400 leading-relaxed">
              Seleziona uno o più servizi…
            </span>
          ) : (
            selected.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium"
                style={{ borderColor: "rgba(164,121,75,0.4)", background: "rgba(164,121,75,0.07)", color: "var(--color-gold)" }}
              >
                {s}
                <button type="button" onClick={e => remove(s, e)} className="opacity-60 hover:opacity-100 transition">
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={16}
          className="mt-1 shrink-0 text-neutral-400 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-sand-dark bg-white shadow-lg"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {SERVIZI.map((s, i) => {
              const active = selected.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-paper-muted"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--color-sand)" : undefined,
                    color: active ? "var(--color-gold)" : "var(--color-ink)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {s}
                  {active && <Check size={14} className="shrink-0" style={{ color: "var(--color-gold)" }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main form ───────────────────────────────────────────────────────── */
type Stage = "form" | "loading" | "revealed";

export function GiveawayForm() {
  const [stage, setStage]           = useState<Stage>("form");
  const [nome, setNome]             = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [servizi, setServizi]       = useState<string[]>([]);
  const [consenso, setConsenso]     = useState(false);

  const isValid = nome.trim().length > 0 && dataNascita !== "" && servizi.length > 0 && consenso;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setStage("loading");
    await new Promise<void>(r => setTimeout(r, 820));
    setStage("revealed");
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  return (
    <AnimatePresence mode="wait">

      {/* ─── Form ─────────────────────────────────────────────────── */}
      {(stage === "form" || stage === "loading") && (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.42 }}
        >
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Come ti chiami?"
              required
              className="rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          {/* Data di nascita */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
              Data di nascita
            </label>
            <input
              type="date"
              value={dataNascita}
              onChange={e => setDataNascita(e.target.value)}
              required
              className="rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          {/* Servizi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
              Di cosa hai bisogno?
            </label>
            <ServiziSelect selected={servizi} onChange={setServizi} />
          </div>

          {/* Consenso */}
          <div className="flex items-start gap-3 rounded-xl border border-sand-dark bg-paper-muted px-4 py-3">
            <input
              id="consenso"
              type="checkbox"
              checked={consenso}
              onChange={e => setConsenso(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded"
              style={{ accentColor: "var(--color-gold)" }}
            />
            <label htmlFor="consenso" className="cursor-pointer text-xs leading-relaxed text-ink-soft">
              Tienimi aggiornata/o sulle novità MAD — nuovi trattamenti, offerte e tutto quello che succede in salone.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || stage === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-paper transition-all hover:bg-ink/85 active:scale-[0.98] disabled:opacity-35"
          >
            {stage === "loading" ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-paper/30 border-t-paper animate-spin" />
                Un attimo…
              </>
            ) : (
              "Scopri il tuo regalo →"
            )}
          </button>
        </motion.form>
      )}

      {/* ─── Reveal ───────────────────────────────────────────────── */}
      {stage === "revealed" && (
        <motion.div
          key="revealed"
          className="relative flex w-full flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {/* Confetti */}
          <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2">
            {CONFETTI.map(p => (
              <motion.div
                key={p.id}
                className="absolute rounded-sm"
                style={{ width: p.w, height: p.h, background: p.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.3 }}
                transition={{ duration: 1.9, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>

          {/* Copy */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">Eccolo. È tuo.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Una Gift Card da <span className="font-semibold text-ink">€25</span> da usare quando vuoi da MAD Vigevano.
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 32, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.25, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardScene>
              <VirtualGiftCard
                amount={25}
                recipientName={nome}
                buyerFullName="MAD Vigevano"
                customMessage="Ti aspettiamo in salone. Sarai contattato a breve."
                cardCode="MAD-GIVE-AWAY"
                expiresAt={expiresAt}
              />
            </CardScene>
          </motion.div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
