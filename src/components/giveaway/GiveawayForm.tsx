"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Check, X } from "lucide-react";
import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";
import { CardScene } from "@/components/gift/CardScene";
import { UnwrappingExperience } from "@/components/gift/UnwrappingExperience";
import { GiveawayCountdown } from "./GiveawayCountdown";

/* ─── Servizi reali MAD Vigevano (da listino-prezzi) ─────────────────── */
const SERVIZI_GRUPPI: { label: string; items: string[] }[] = [
  {
    label: "Taglio",
    items: ["Taglio donna", "Taglio uomo"],
  },
  {
    label: "Piega & Styling",
    items: ["Piega capelli corti", "Piega capelli lunghi", "Styling"],
  },
  {
    label: "Colorazioni",
    items: [
      "Colore organica",
      "Colore organica + lunghezze",
      "Gloss color",
      "Decolorazione",
    ],
  },
  {
    label: "Schiariture",
    items: ["Balayage", "Bleach No Bleach", "Airtouch / Hair Touch"],
  },
  {
    label: "Trattamenti",
    items: [
      "Ristrutturazione profonda",
      "Hair Filler",
      "Detox",
      "Ossigenoterapia",
      "Ozonoterapia",
      "OXY Hair Spa",
      "Nanoplastia",
      "Permanente",
    ],
  },
  {
    label: "Eventi & Shooting",
    items: [
      "Preparazione sposa",
      "Preparazione shooting",
      "Hair Styling & Art Direction",
      "Fashion Show & Events",
    ],
  },
];

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
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex min-h-[48px] w-full items-start gap-2 rounded-xl border border-sand-dark bg-white px-4 py-2.5 text-left transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
      >
        <div className="flex flex-1 flex-wrap gap-1.5 py-0.5">
          {selected.length === 0 ? (
            <span className="text-sm text-neutral-400 leading-relaxed">Seleziona uno o più servizi…</span>
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

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-sand-dark bg-white shadow-lg"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {SERVIZI_GRUPPI.map((gruppo, gi) => (
              <div key={gruppo.label}>
                <div
                  className="sticky top-0 px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: "var(--color-paper-muted)",
                    color: "var(--color-ink-soft)",
                    borderTop: gi > 0 ? "1px solid var(--color-sand)" : undefined,
                  }}
                >
                  {gruppo.label}
                </div>
                {gruppo.items.map((s, i) => {
                  const active = selected.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-paper-muted"
                      style={{
                        borderBottom: i < gruppo.items.length - 1 ? "1px solid var(--color-sand)" : undefined,
                        color: active ? "var(--color-gold)" : "var(--color-ink)",
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {s}
                      {active && <Check size={14} className="shrink-0" style={{ color: "var(--color-gold)" }} />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Date picker premium ────────────────────────────────────────────── */
const MESI = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];
const GIORNI = Array.from({ length: 31 }, (_, i) => i + 1);
const ANNI   = Array.from({ length: 90  }, (_, i) => 2012 - i);

function Sel({
  value, onChange, placeholder, children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  const empty = value === "";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-sand-dark bg-white px-3.5 py-3 pr-8 text-sm outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
        style={{ WebkitAppearance: "none", appearance: "none", color: empty ? "#a3a3a3" : "var(--color-ink)" }}
      >
        <option value="" disabled>{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

function DatePickerNascita({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [g, setG] = useState(value ? value.split("-")[2] ?? "" : "");
  const [m, setM] = useState(value ? value.split("-")[1] ?? "" : "");
  const [a, setA] = useState(value ? value.split("-")[0] ?? "" : "");

  function emit(giorno: string, mese: string, anno: string) {
    if (giorno && mese && anno) onChange(`${anno}-${mese}-${giorno.padStart(2, "0")}`);
    else onChange("");
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Sel value={g} placeholder="Giorno" onChange={v => { setG(v); emit(v, m, a); }}>
        {GIORNI.map(n => <option key={n} value={String(n).padStart(2, "0")}>{n}</option>)}
      </Sel>
      <Sel value={m} placeholder="Mese" onChange={v => { setM(v); emit(g, v, a); }}>
        {MESI.map((nome, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>{nome}</option>
        ))}
      </Sel>
      <Sel value={a} placeholder="Anno" onChange={v => { setA(v); emit(g, m, v); }}>
        {ANNI.map(n => <option key={n} value={String(n)}>{n}</option>)}
      </Sel>
    </div>
  );
}

/* ─── Pagina principale ───────────────────────────────────────────────── */
type Stage = "form" | "loading" | "revealed";

export function GiveawayForm() {
  const [stage, setStage]             = useState<Stage>("form");
  const [nome, setNome]               = useState("");
  const [cognome, setCognome]         = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [servizi, setServizi]         = useState<string[]>([]);
  const [nota, setNota]               = useState("");
  const [privacy, setPrivacy]         = useState(false);
  const [marketing, setMarketing]     = useState(false);

  const isValid = nome.trim().length > 0 && cognome.trim().length > 0 && dataNascita !== "" && servizi.length > 0 && privacy;

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

      {/* ─── FORM ─────────────────────────────────────────────────── */}
      {stage !== "revealed" && (
        <motion.div
          key="form-page"
          className="flex min-h-screen flex-col items-center bg-paper px-6 py-14 sm:py-20"
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
        >
          {/* Hero */}
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
            <GiveawayCountdown />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-5">

            {/* Nome + Cognome */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Nome</label>
                <input
                  type="text" value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Nome" required autoComplete="given-name"
                  className="rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Cognome</label>
                <input
                  type="text" value={cognome} onChange={e => setCognome(e.target.value)}
                  placeholder="Cognome" required autoComplete="family-name"
                  className="rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>

            {/* Data di nascita */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Data di nascita</label>
              <DatePickerNascita value={dataNascita} onChange={setDataNascita} />
            </div>

            {/* Trattamenti preferiti */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
                Quali sono i tuoi trattamenti preferiti?
              </label>
              <ServiziSelect selected={servizi} onChange={setServizi} />
            </div>

            {/* Nota libera */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
                Una domanda, una richiesta, un feedback
              </label>
              <textarea
                value={nota} onChange={e => setNota(e.target.value)}
                placeholder="Scrivici qualcosa — ci fa piacere leggerti."
                rows={3}
                className="resize-none rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
              />
            </div>

            {/* Consensi */}
            <div className="flex flex-col gap-2.5 rounded-xl border border-sand-dark bg-paper-muted px-4 py-3.5">
              <div className="flex items-start gap-3">
                <input
                  id="marketing" type="checkbox" checked={marketing}
                  onChange={e => setMarketing(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded"
                  style={{ accentColor: "var(--color-gold)" }}
                />
                <label htmlFor="marketing" className="cursor-pointer text-xs leading-relaxed text-ink-soft">
                  Acconsento a ricevere offerte riservate, novità e promozioni da MAD Vigevano via WhatsApp o email.
                  Posso revocare il consenso in qualsiasi momento.{" "}
                  <span className="text-[0.65rem] text-neutral-400">(facoltativo)</span>
                </label>
              </div>
              <div className="border-t border-sand" />
              <div className="flex items-start gap-3">
                <input
                  id="privacy" type="checkbox" required checked={privacy}
                  onChange={e => setPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded"
                  style={{ accentColor: "var(--color-gold)" }}
                />
                <label htmlFor="privacy" className="cursor-pointer text-xs leading-relaxed text-ink-soft">
                  Ho letto e accetto l&apos;<span className="font-medium text-ink">informativa sul trattamento dei dati personali</span>.{" "}
                  I miei dati saranno trattati da MAD Vigevano (Via Cairoli 6, Vigevano PV) esclusivamente per gestire questa richiesta.{" "}
                  <span className="text-[0.65rem] text-neutral-400">(obbligatorio)</span>
                </label>
              </div>
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

            {/* Note legali */}
            <p className="text-center text-[0.62rem] leading-relaxed text-neutral-400">
              Titolare del trattamento: MAD Vigevano · Via Cairoli 6, 27029 Vigevano (PV) · Tel.&nbsp;0381&nbsp;644268.
              Hai diritto di accedere, rettificare o cancellare i tuoi dati contattandoci al numero sopra.
            </p>
          </form>
        </motion.div>
      )}

      {/* ─── UNBOXING — identico alla pagina regalo ───────────────── */}
      {stage === "revealed" && (
        <motion.div
          key="gift-page"
          className="flex min-h-screen flex-col items-center bg-paper px-6 py-12 sm:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/50 bg-gold/5 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
              <Sparkles className="h-3 w-3" />
              Gift Card
            </span>
            <p className="font-display text-2xl font-semibold text-ink">MAD Vigevano</p>
          </div>

          <div className="w-full max-w-md">
            <UnwrappingExperience noHint>
              <CardScene skipEntrance>
                <VirtualGiftCard
                  amount={25}
                  recipientName={`${nome} ${cognome}`.trim()}
                  buyerFullName="MAD Vigevano"
                  customMessage="Un regalo per ringraziare i nostri cari clienti"
                  cardCode="MAD-GIVE-AWAY"
                  expiresAt={expiresAt}
                />
              </CardScene>
            </UnwrappingExperience>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
