"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Copy, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import {
  createDiscountCode,
  deleteDiscountCode,
  listDiscountCodes,
  updateDiscountCode,
  type AdminDiscountCode,
  type DiscountCodeInput,
  type DiscountListResult,
  type DiscountMutationResult,
} from "@/app/cassa/discountActions";
import { DiscountScope, DiscountType } from "@/generated/prisma/enums";
import { DISCOUNTABLE_PRODUCTS, getProductName } from "@/lib/giftCardProducts";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dateTime = new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" });

type CodeState = "scheduled" | "active" | "expired" | "exhausted" | "disabled";

const STATE_LABEL: Record<CodeState, string> = {
  scheduled: "Programmato",
  active: "Attivo",
  expired: "Scaduto",
  exhausted: "Esaurito",
  disabled: "Disattivato",
};

const STATE_STYLE: Record<CodeState, string> = {
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  exhausted: "bg-amber-50 text-amber-700 border-amber-200",
  disabled: "bg-paper-muted text-ink-soft border-line",
};

function codeState(c: AdminDiscountCode, now: number): CodeState {
  if (!c.active) return "disabled";
  if (now < new Date(c.startsAt).getTime()) return "scheduled";
  if (now >= new Date(c.endsAt).getTime()) return "expired";
  if (c.maxUses != null && c.usedCount >= c.maxUses) return "exhausted";
  return "active";
}

function discountLabel(c: Pick<AdminDiscountCode, "type" | "value">): string {
  return c.type === DiscountType.PERCENT ? `${c.value}%` : `−${currency.format(c.value)}`;
}

function scopeLabel(c: AdminDiscountCode): string {
  const parts = [c.scope === DiscountScope.ALL ? "Tutte le gift card" : c.productSlugs.map(getProductName).join(", ")];
  if (c.minAmount != null) parts.push(`da ${currency.format(c.minAmount)}`);
  return parts.join(" · ");
}

/** ISO → valore per <input type="datetime-local"> nell'ora locale del browser. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface FormState {
  code: string;
  description: string;
  type: DiscountType;
  value: string;
  scope: DiscountScope;
  productSlugs: string[];
  minAmount: string;
  maxUses: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  isPublic: boolean;
}

function emptyForm(): FormState {
  const start = new Date();
  start.setSeconds(0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  end.setHours(23, 59, 0, 0);
  return {
    code: "",
    description: "",
    type: DiscountType.PERCENT,
    value: "10",
    scope: DiscountScope.ALL,
    productSlugs: [],
    minAmount: "",
    maxUses: "",
    startsAt: toLocalInput(start.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    active: true,
    isPublic: false,
  };
}

function formFromCode(c: AdminDiscountCode): FormState {
  return {
    code: c.code,
    description: c.description ?? "",
    type: c.type,
    value: String(c.value),
    scope: c.scope,
    productSlugs: c.productSlugs,
    minAmount: c.minAmount != null ? String(c.minAmount) : "",
    maxUses: c.maxUses != null ? String(c.maxUses) : "",
    startsAt: toLocalInput(c.startsAt),
    endsAt: toLocalInput(c.endsAt),
    active: c.active,
    isPublic: c.isPublic,
  };
}

function toInput(f: FormState): DiscountCodeInput {
  return {
    code: f.code,
    description: f.description || undefined,
    type: f.type,
    value: Number(f.value.replace(",", ".")),
    scope: f.scope,
    productSlugs: f.productSlugs,
    minAmount: f.minAmount ? Number(f.minAmount.replace(",", ".")) : null,
    maxUses: f.maxUses ? Number(f.maxUses) : null,
    // Il browser del salone è in ora italiana: l'ora inserita è quella di Vigevano.
    startsAt: new Date(f.startsAt).toISOString(),
    endsAt: new Date(f.endsAt).toISOString(),
    active: f.active,
    isPublic: f.isPublic,
  };
}

type Editor = { mode: "create" } | { mode: "edit"; id: string; usedCount: number } | null;

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold";
const labelClass = "mb-1 block text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft";

export function DiscountCodesAdmin() {
  const [codes, setCodes] = useState<AdminDiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [editor, setEditor] = useState<Editor>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const applyResult = useCallback((result: DiscountListResult) => {
    if (!result.authorized) setSessionExpired(true);
    else setCodes(result.codes);
    setNow(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    listDiscountCodes().then(applyResult);
  }, [applyResult]);

  function refresh() {
    setLoading(true);
    listDiscountCodes().then(applyResult);
  }

  function handleMutation(result: DiscountMutationResult, onOk: () => void) {
    if (result.ok) {
      onOk();
      refresh();
    } else if (result.unauthorized) {
      setSessionExpired(true);
    } else {
      setError(result.error);
    }
  }

  function openCreate() {
    setForm(emptyForm());
    setError(null);
    setEditor({ mode: "create" });
  }

  function openEdit(c: AdminDiscountCode) {
    setForm(formFromCode(c));
    setError(null);
    setEditor({ mode: "edit", id: c.id, usedCount: c.usedCount });
  }

  function openDuplicate(c: AdminDiscountCode) {
    setForm({ ...formFromCode(c), code: `${c.code}-2`, active: true });
    setError(null);
    setEditor({ mode: "create" });
  }

  function handleSave() {
    if (!editor) return;
    if (!form.startsAt || !form.endsAt) {
      setError("Inserisci data di inizio e di scadenza.");
      return;
    }
    const input = toInput(form);
    setError(null);
    startTransition(async () => {
      const result =
        editor.mode === "create"
          ? await createDiscountCode(input)
          : await updateDiscountCode(editor.id, input);
      handleMutation(result, () => setEditor(null));
    });
  }

  function handleDelete(c: AdminDiscountCode) {
    const warning =
      c.usedCount > 0
        ? `\n\nÈ stato usato ${c.usedCount} volte: gli ordini già pagati restano invariati.`
        : "";
    if (!window.confirm(`Eliminare definitivamente il codice ${c.code}?${warning}`)) return;
    startTransition(async () => {
      handleMutation(await deleteDiscountCode(c.id), () => {
        if (editor?.mode === "edit" && editor.id === c.id) setEditor(null);
      });
    });
  }

  function setEnd(kind: "week" | "month" | "year") {
    const base = form.startsAt ? new Date(form.startsAt) : new Date();
    const end = new Date(base);
    if (kind === "week") end.setDate(end.getDate() + 7);
    if (kind === "month") end.setMonth(end.getMonth() + 1, 0);
    if (kind === "year") end.setMonth(11, 31);
    end.setHours(23, 59, 0, 0);
    setForm({ ...form, endsAt: toLocalInput(end.toISOString()) });
  }

  if (sessionExpired) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        Sessione scaduta. Ricarica la pagina e inserisci di nuovo il PIN.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Codici sconto</h2>
          <p className="text-sm text-ink-soft">
            Lo sconto riduce il prezzo pagato: la gift card mantiene sempre il valore pieno.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-gold-soft hover:text-ink"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Aggiorna
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            <Plus className="h-4 w-4" />
            Nuovo codice
          </button>
        </div>
      </div>

      {editor && (
        <div className="rounded-3xl border border-gold/40 bg-paper p-5 shadow-lg shadow-ink/5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-ink">
              {editor.mode === "create" ? "Nuovo codice sconto" : `Modifica ${form.code}`}
            </h3>
            <button type="button" onClick={() => setEditor(null)} aria-label="Chiudi" className="text-ink-soft hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="dc-code">Codice</label>
              <input
                id="dc-code"
                className={`${inputClass} font-mono uppercase tracking-wider`}
                value={form.code}
                placeholder="MAD10"
                maxLength={20}
                disabled={editor.mode === "edit" && editor.usedCount > 0}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dc-desc">Descrizione interna</label>
              <input
                id="dc-desc"
                className={inputClass}
                value={form.description}
                placeholder="Es. Promo Black Friday Instagram"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <span className={labelClass}>Tipo di sconto</span>
              <div className="flex gap-2">
                {[
                  { v: DiscountType.PERCENT, l: "Percentuale %" },
                  { v: DiscountType.FIXED_AMOUNT, l: "Importo €" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setForm({ ...form, type: o.v })}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                      form.type === o.v ? "border-gold bg-ink text-paper" : "border-line text-ink hover:border-gold-soft"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="dc-value">
                {form.type === DiscountType.PERCENT ? "Percentuale di sconto" : "Sconto in euro"}
              </label>
              <input
                id="dc-value"
                className={inputClass}
                inputMode="decimal"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="dc-start">Data e ora di inizio</label>
              <input
                id="dc-start"
                type="datetime-local"
                className={inputClass}
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dc-end">Data e ora di scadenza</label>
              <input
                id="dc-end"
                type="datetime-local"
                className={inputClass}
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
              <div className="mt-1.5 flex gap-1.5 text-xs">
                {([
                  ["week", "+7 giorni"],
                  ["month", "Fine mese"],
                  ["year", "31/12"],
                ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEnd(k)}
                    className="rounded-full border border-line px-2.5 py-0.5 text-ink-soft hover:border-gold-soft hover:text-ink"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className={labelClass}>Si applica a</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: DiscountScope.ALL, l: "Tutte le gift card" },
                  { v: DiscountScope.SELECTED, l: "Solo alcune" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setForm({ ...form, scope: o.v })}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      form.scope === o.v ? "border-gold bg-ink text-paper" : "border-line text-ink hover:border-gold-soft"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              {form.scope === DiscountScope.SELECTED && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {DISCOUNTABLE_PRODUCTS.map((p) => {
                    const checked = form.productSlugs.includes(p.slug);
                    return (
                      <label
                        key={p.slug}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                          checked ? "border-gold bg-gold/10 text-ink" : "border-line text-ink-soft"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-gold"
                          checked={checked}
                          onChange={() =>
                            setForm({
                              ...form,
                              productSlugs: checked
                                ? form.productSlugs.filter((s) => s !== p.slug)
                                : [...form.productSlugs, p.slug],
                            })
                          }
                        />
                        {p.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="dc-min">Valore minimo della card (facoltativo)</label>
              <input
                id="dc-min"
                className={inputClass}
                inputMode="decimal"
                placeholder="Es. 100"
                value={form.minAmount}
                onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dc-max">Utilizzi massimi (facoltativo)</label>
              <input
                id="dc-max"
                className={inputClass}
                inputMode="numeric"
                placeholder="Illimitati"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value.replace(/\D/g, "") })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Attivo
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              />
              Mostra nel banner del sito madvigevano.it
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="rounded-full border border-line px-5 py-2 text-sm text-ink-soft hover:text-ink"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="rounded-full bg-ink px-6 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-40"
            >
              {isPending ? "Salvataggio…" : "Salva codice"}
            </button>
          </div>
        </div>
      )}

      {!editor && error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}

      {loading && codes.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">Caricamento…</p>
      ) : codes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-14 text-center text-sm text-ink-soft">
          Nessun codice sconto. Crea il primo, per esempio <span className="font-mono">MAD10</span>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="whitespace-nowrap border-b border-line bg-paper-muted/50 text-left text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">
                <th className="px-4 py-3 font-medium">Codice</th>
                <th className="px-4 py-3 font-medium">Sconto</th>
                <th className="px-4 py-3 font-medium">Inizio</th>
                <th className="px-4 py-3 font-medium">Scadenza</th>
                <th className="px-4 py-3 font-medium">Si applica a</th>
                <th className="px-4 py-3 text-right font-medium">Utilizzi</th>
                <th className="px-4 py-3 text-right font-medium">Incasso</th>
                <th className="px-4 py-3 font-medium">Stato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {codes.map((c) => {
                const state = codeState(c, now);
                return (
                  <tr key={c.id} className="align-top hover:bg-paper-muted/40">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold tracking-wider text-ink">{c.code}</span>
                      {c.isPublic && (
                        <span className="ml-2 whitespace-nowrap rounded-full bg-gold/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-gold">
                          sul sito
                        </span>
                      )}
                      {c.description && <p className="mt-0.5 text-xs text-ink-soft">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{discountLabel(c)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{dateTime.format(new Date(c.startsAt))}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{dateTime.format(new Date(c.endsAt))}</td>
                    <td className="min-w-[180px] px-4 py-3 text-ink-soft">{scopeLabel(c)}</td>
                    <td className="px-4 py-3 text-right text-ink">
                      {c.usedCount}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-soft">
                      {currency.format(c.revenue)}
                      {c.discountGiven > 0 && (
                        <p className="text-xs text-gold">−{currency.format(c.discountGiven)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATE_STYLE[state]}`}>
                        {STATE_LABEL[state]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Modifica" onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-muted hover:text-ink">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" title="Duplica" onClick={() => openDuplicate(c)} className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-muted hover:text-ink">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" title="Elimina" disabled={isPending} onClick={() => handleDelete(c)} className="rounded-lg p-1.5 text-ink-soft hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
