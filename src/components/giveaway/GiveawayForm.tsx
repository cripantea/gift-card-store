"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Gift, X } from "lucide-react";
import { recoverGiveaway, submitGiveaway } from "@/app/give-away/actions";
import { GIVEAWAY_KNOWN_SINCE, GIVEAWAY_SOURCES, SERVIZI_GRUPPI } from "@/lib/giveawayOptions";

const inputClass =
  "w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30";
const labelClass = "text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-soft";

function Select({
  id, value, onChange, placeholder, options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className={`${inputClass} pr-9`}
        style={{ WebkitAppearance: "none", appearance: "none", color: value ? "var(--color-ink)" : "#a3a3a3" }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

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

/** "Hai già partecipato?": ritrova il regalo con email + cellulare, senza ricompilare il form. */
function AlreadyParticipated() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await recoverGiveaway(email, phone);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-gold underline underline-offset-4">
        Hai già partecipato? Ritrova il tuo regalo
      </button>
    );
  }

  return (
    <form onSubmit={handleRecover} className="flex w-full flex-col gap-2.5 rounded-xl border border-sand-dark bg-paper-muted px-4 py-3.5">
      <p className="text-xs text-ink-soft">Inserisci l&apos;email e il cellulare usati quando hai compilato il form.</p>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="La tua email"
        required autoComplete="email" className={inputClass} />
      <input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 333 123 4567"
        required autoComplete="tel" className={inputClass} />
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <button type="submit" disabled={isPending}
        className="rounded-xl bg-ink py-3 text-sm font-semibold text-paper transition-all hover:bg-ink/85 disabled:opacity-40">
        {isPending ? "Un attimo…" : "Ritrova il mio regalo"}
      </button>
    </form>
  );
}

export function GiveawayForm({ campaign, isOpen }: { campaign: string | null; isOpen: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [source, setSource]           = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [knownSince, setKnownSince]   = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [servizi, setServizi]         = useState<string[]>([]);
  const [nota, setNota]               = useState("");
  const [privacy, setPrivacy]         = useState(false);
  const [marketing, setMarketing]     = useState(false);

  const isValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    phone.trim().length >= 6 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    source !== "" &&
    (source !== "Altro" || sourceOther.trim() !== "") &&
    knownSince !== "" &&
    dataNascita !== "" &&
    servizi.length > 0 &&
    privacy;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await submitGiveaway({
        firstName,
        lastName,
        phone,
        email,
        source,
        sourceOther: source === "Altro" ? sourceOther : undefined,
        knownSince,
        birthDate: dataNascita,
        favoriteServices: servizi,
        note: nota.trim() || undefined,
        marketingConsent: marketing,
        privacyConsent: privacy,
        campaign: campaign ?? undefined,
      });
      if (result.ok) router.push(`/gift/${result.secretToken}`);
      else setError(result.error);
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-14 sm:py-20">
      {/* Hero */}
      <div className="mb-10 flex w-full max-w-md flex-col gap-4">
        <span
          className="w-fit rounded-full px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em]"
          style={{ background: "rgba(164,121,75,0.09)", color: "var(--color-gold)" }}
        >
          Un pensiero riservato
        </span>
        <h1 className="font-display text-[2rem] font-semibold leading-tight text-ink sm:text-4xl">
          Ma è solo per te.
        </h1>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
          <p className="font-display text-lg italic text-ink">
            Questa volta abbiamo pensato a te.
          </p>
          <p>
            Ogni volta che scegli MAD ci regali qualcosa di prezioso: la tua fiducia.
            Oggi voglio ricambiare.
          </p>
          <p>
            In occasione del lancio della nuova Gift Card sul nostro sito ho riservato
            una <span className="font-semibold text-ink">Gift Card da 50 €</span> proprio per te.
          </p>
        </div>
        <a
          href="#ritira"
          className="group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-gold/10"
          style={{ borderColor: "rgba(164,121,75,0.3)", background: "rgba(164,121,75,0.05)" }}
        >
          <Gift className="h-5 w-5 shrink-0" style={{ color: "var(--color-gold)" }} />
          <p className="flex-1 text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">La tua Gift Card MAD da 50 €</span> · valida 12 mesi,
            da usare in salone su tutti i servizi.
          </p>
          <span className="text-xs font-semibold text-gold transition-transform group-hover:translate-y-0.5">Ritirala ↓</span>
        </a>
      </div>

      {!isOpen ? (
        <p className="w-full max-w-md rounded-xl border border-sand-dark bg-paper-muted px-4 py-4 text-sm text-ink-soft">
          Il Give Away si è concluso. Grazie di cuore per averci pensato — ti aspettiamo in salone.
        </p>
      ) : (
        <form id="ritira" onSubmit={handleSubmit} className="flex w-full max-w-md scroll-mt-6 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gw-nome" className={labelClass}>Nome</label>
              <input id="gw-nome" type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Nome" required autoComplete="given-name" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gw-cognome" className={labelClass}>Cognome</label>
              <input id="gw-cognome" type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Cognome" required autoComplete="family-name" className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gw-telefono" className={labelClass}>Cellulare (WhatsApp)</label>
            <input id="gw-telefono" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+39 333 123 4567" required autoComplete="tel" className={inputClass} />
            <p className="text-[0.68rem] text-neutral-400">Una Gift Card per numero: ti serve per ritrovarla.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gw-email" className={labelClass}>Email</label>
            <input id="gw-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nome@esempio.it" required autoComplete="email" maxLength={200} className={inputClass} />
            <p className="text-[0.68rem] text-neutral-400">Ci serve per riconoscerti se riapri il link: il tuo regalo resta sempre a portata di mano.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Data di nascita</label>
            <DatePickerNascita value={dataNascita} onChange={setDataNascita} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Quali sono i tuoi trattamenti preferiti?</label>
            <ServiziSelect selected={servizi} onChange={setServizi} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gw-dove" className={labelClass}>Dove ci hai conosciuto?</label>
            <Select id="gw-dove" value={source} onChange={setSource} placeholder="Seleziona…" options={GIVEAWAY_SOURCES} />
            {source === "Altro" && (
              <input type="text" value={sourceOther} onChange={e => setSourceOther(e.target.value)}
                placeholder="Raccontaci dove" maxLength={200} required className={`${inputClass} mt-1`} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gw-quanto" className={labelClass}>Da quanto ci conosci?</label>
            <Select id="gw-quanto" value={knownSince} onChange={setKnownSince} placeholder="Seleziona…" options={GIVEAWAY_KNOWN_SINCE} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="gw-nota" className={labelClass}>Una domanda, una richiesta, un feedback</label>
            <textarea
              id="gw-nota" value={nota} onChange={e => setNota(e.target.value)}
              placeholder="Scrivici qualcosa — ci fa piacere leggerti." rows={3} maxLength={1000}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-sand-dark bg-paper-muted px-4 py-3.5">
            <div className="flex items-start gap-3">
              <input id="marketing" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded" style={{ accentColor: "var(--color-gold)" }} />
              <label htmlFor="marketing" className="cursor-pointer text-xs leading-relaxed text-ink-soft">
                Acconsento a ricevere offerte riservate, novità e promozioni da MAD Vigevano via WhatsApp.
                Posso revocare il consenso in qualsiasi momento.{" "}
                <span className="text-[0.65rem] text-neutral-400">(facoltativo)</span>
              </label>
            </div>
            <div className="border-t border-sand" />
            <div className="flex items-start gap-3">
              <input id="privacy" type="checkbox" required checked={privacy} onChange={e => setPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded" style={{ accentColor: "var(--color-gold)" }} />
              <label htmlFor="privacy" className="cursor-pointer text-xs leading-relaxed text-ink-soft">
                Ho letto e accetto l&apos;<span className="font-medium text-ink">informativa sul trattamento dei dati personali</span>.{" "}
                I miei dati saranno trattati da MAD Vigevano (Via Cairoli 6, Vigevano PV) per gestire questa Gift Card
                e contattarmi su WhatsApp.{" "}
                <span className="text-[0.65rem] text-neutral-400">(obbligatorio)</span>
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-paper transition-all hover:bg-ink/85 active:scale-[0.98] disabled:opacity-35"
          >
            {isPending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                Stiamo incartando il tuo regalo…
              </>
            ) : (
              "Apri il tuo regalo →"
            )}
          </button>

          <p className="text-center text-[0.62rem] leading-relaxed text-neutral-400">
            Titolare del trattamento: MAD Vigevano · Via Cairoli 6, 27029 Vigevano (PV) · Tel.&nbsp;0381&nbsp;644268.
            Hai diritto di accedere, rettificare o cancellare i tuoi dati contattandoci al numero sopra.
          </p>
        </form>
      )}

      {isOpen && (
        <div className="mt-8 flex w-full max-w-md flex-col items-center">
          <AlreadyParticipated />
        </div>
      )}
    </div>
  );
}
