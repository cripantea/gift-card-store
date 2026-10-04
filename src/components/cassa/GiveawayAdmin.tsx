"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, Download, RefreshCw, XCircle } from "lucide-react";
import {
  loadGiveawayEntries,
  type AdminGiveawayEntry,
  type AdminGiveawayResult,
} from "@/app/cassa/giveawayActions";
import { GiftCardStatus } from "@/generated/prisma/enums";

const dateTime = new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" });

/** "1990-05-14" → "14/05/1990" senza passare dal fuso orario. */
function formatBirthDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const SHARE_LINK = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://shop.madvigevano.it"}/giveaway?src=whatsapp`;

function sourceLabel(e: AdminGiveawayEntry): string {
  return e.source === "Altro" && e.sourceOther ? `Altro: ${e.sourceOther}` : e.source;
}

function cardLabel(e: AdminGiveawayEntry): string {
  if (e.cardStatus === GiftCardStatus.REDEEMED) return "Riscattata";
  if (e.cardStatus === GiftCardStatus.EXPIRED) return "Scaduta";
  return e.cardOpened ? "Aperta" : "Non ancora aperta";
}

/** Conteggio delle risposte per valore, dal più frequente. */
function countBy(entries: AdminGiveawayEntry[], key: (e: AdminGiveawayEntry) => string): [string, number][] {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(key(e), (counts.get(key(e)) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function GiveawayAdmin() {
  const [entries, setEntries] = useState<AdminGiveawayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  const applyResult = useCallback((result: AdminGiveawayResult) => {
    if (!result.authorized) setSessionExpired(true);
    else setEntries(result.entries);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGiveawayEntries().then(applyResult);
  }, [applyResult]);

  function handleRefresh() {
    setLoading(true);
    loadGiveawayEntries().then(applyResult);
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(SHARE_LINK)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(console.error);
  }

  function handleExportCSV() {
    if (!entries.length) return;
    const header = ["Data", "Nome", "Cognome", "Telefono", "Dove ci ha conosciuto", "Da quanto ci conosce", "Data di nascita", "Trattamenti preferiti", "Nota", "Consenso marketing", "Provenienza link", "Codice gift card", "Stato gift card"];
    const rows = entries.map((e) => [
      dateTime.format(new Date(e.createdAt)),
      e.firstName,
      e.lastName,
      e.phone,
      sourceLabel(e),
      e.knownSince,
      formatBirthDate(e.birthDate),
      e.favoriteServices.join(", "),
      e.note ?? "",
      e.marketingConsent ? "Sì" : "No",
      e.campaign ?? "",
      e.cardCode,
      cardLabel(e),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giveaway-MAD-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (sessionExpired) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <XCircle className="h-10 w-10 text-red-400" />
        <p className="font-display text-xl font-semibold text-ink">Sessione scaduta</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Ricarica
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-gold/60" />
      </div>
    );
  }

  const bySource = countBy(entries, (e) => e.source);
  const byKnownSince = countBy(entries, (e) => e.knownSince);
  const redeemed = entries.filter((e) => e.cardStatus === GiftCardStatus.REDEEMED).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Link da condividere */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink">Link da mandare su WhatsApp (uguale per tutti)</p>
          <p className="truncate font-mono text-xs text-ink-soft">{SHARE_LINK}</p>
          <p className="mt-1 text-[0.65rem] text-ink-soft/70">
            Le risposte restano solo qui nello shop: non vengono inviate al CRM.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-ink/85"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiato" : "Copia link"}
        </button>
      </div>

      {/* Riepilogo */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-line bg-paper p-4">
          <p className="text-xl font-semibold text-ink">{entries.length}</p>
          <p className="text-xs text-ink-soft">Risposte · {redeemed} gift card riscattate</p>
        </div>
        <Breakdown title="Dove ci hanno conosciuto" rows={bySource} />
        <Breakdown title="Da quanto ci conoscono" rows={byKnownSince} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold-soft hover:text-ink"
        >
          <RefreshCw className="h-3 w-3" />
          Aggiorna
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-paper transition-opacity hover:opacity-80"
        >
          <Download className="h-3 w-3" />
          Esporta CSV
        </button>
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto rounded-2xl border border-line">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <AlertTriangle className="h-7 w-7 text-ink-soft/40" />
            <p className="text-sm text-ink-soft">Ancora nessuna risposta al Give Away.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-muted/50">
                {["Nome", "Dove ci ha conosciuto", "Da quanto ci conosce", "Data", "Dettagli", "Gift card"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((e) => (
                <tr key={e.id} className="bg-paper transition-colors hover:bg-paper-muted/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-ink-soft/70">
                      {e.phone}
                      {e.marketingConsent && " · ok promo"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink">{sourceLabel(e)}</td>
                  <td className="px-4 py-3 text-ink">{e.knownSince}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{dateTime.format(new Date(e.createdAt))}</td>
                  <td className="min-w-[14rem] px-4 py-3 text-xs text-ink-soft">
                    {e.birthDate && <p>Nata/o il {formatBirthDate(e.birthDate)}</p>}
                    {e.favoriteServices.length > 0 && <p>Preferiti: {e.favoriteServices.join(", ")}</p>}
                    {e.note && <p className="mt-1 italic text-ink">“{e.note}”</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs tracking-wider text-ink-soft">{e.cardCode}</p>
                    <p className="text-[0.65rem] text-gold">{cardLabel(e)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-paper p-4">
      <p className="text-xs font-medium text-ink">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-ink-soft">—</p>
      ) : (
        rows.slice(0, 5).map(([label, count]) => (
          <div key={label} className="flex justify-between gap-3 text-xs text-ink-soft">
            <span className="truncate">{label}</span>
            <span className="font-semibold text-ink">{count}</span>
          </div>
        ))
      )}
    </div>
  );
}
