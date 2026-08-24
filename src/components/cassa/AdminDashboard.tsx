"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { loadAdminDashboard, type AdminGiftCard, type AdminStats } from "@/app/cassa/actions";
import { GiftCardStatus } from "@/generated/prisma/client";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dateShort = new Intl.DateTimeFormat("it-IT", { dateStyle: "short" });
const dateLong = new Intl.DateTimeFormat("it-IT", { dateStyle: "long" });

type Filter = "all" | "active" | "redeemed" | "expired" | "scheduled";

const STATUS_LABEL: Record<GiftCardStatus, string> = {
  ACTIVE: "Attiva",
  REDEEMED: "Riscattata",
  EXPIRED: "Scaduta",
};

const STATUS_STYLE: Record<GiftCardStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REDEEMED: "bg-gold/10 text-gold border-gold/30",
  EXPIRED: "bg-red-50 text-red-700 border-red-200",
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [giftCards, setGiftCards] = useState<AdminGiftCard[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await loadAdminDashboard();
    if (!result.authorized) {
      setSessionExpired(true);
    } else {
      setStats(result.stats);
      setGiftCards(result.giftCards);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = giftCards.filter((gc) => {
    if (filter === "active") return gc.status === GiftCardStatus.ACTIVE && !gc.scheduledAt;
    if (filter === "redeemed") return gc.status === GiftCardStatus.REDEEMED;
    if (filter === "expired") return gc.status === GiftCardStatus.EXPIRED;
    if (filter === "scheduled") return !!gc.scheduledAt && !gc.emailSentAt;
    return true;
  });

  function handleExportCSV() {
    if (!giftCards.length) return;

    const header = [
      "Codice",
      "Importo",
      "Stato",
      "Destinatario",
      "Email destinatario",
      "Acquirente",
      "Email acquirente",
      "Acquistata il",
      "Scade il",
      "Riscattata il",
      "Invio programmato",
      "Email inviata il",
    ];

    const rows = giftCards.map((gc) => [
      gc.cardCode,
      gc.amount.toFixed(2),
      STATUS_LABEL[gc.status],
      gc.recipientName,
      gc.recipientEmail,
      gc.buyerName,
      gc.buyerEmail,
      dateLong.format(new Date(gc.createdAt)),
      dateLong.format(new Date(gc.expiresAt)),
      gc.redeemedAt ? dateLong.format(new Date(gc.redeemedAt)) : "",
      gc.scheduledAt ? dateLong.format(new Date(gc.scheduledAt)) : "",
      gc.emailSentAt ? dateLong.format(new Date(gc.emailSentAt)) : "",
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gift-card-MAD-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (sessionExpired) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <XCircle className="h-10 w-10 text-red-400" />
        <p className="font-display text-xl font-semibold text-ink">Sessione scaduta</p>
        <p className="text-sm text-ink-soft">Ricarica la pagina per continuare.</p>
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

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Incassato totale"
            value={currency.format(stats.totalRevenue)}
            highlight
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Attive"
            value={stats.activeCount}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-gold" />}
            label="Riscattate"
            value={stats.redeemedCount}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="In scadenza (30 gg)"
            value={stats.expiringSoonCount}
            warn={stats.expiringSoonCount > 0}
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4" />}
            label="Programmate"
            value={stats.scheduledCount}
          />
          <StatCard
            icon={<XCircle className="h-4 w-4" />}
            label="Scadute"
            value={stats.expiredCount}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "all", label: "Tutte" },
              { key: "active", label: "Attive" },
              { key: "redeemed", label: "Riscattate" },
              { key: "scheduled", label: "Programmate" },
              { key: "expired", label: "Scadute" },
            ] as { key: Filter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-ink text-paper"
                  : "border border-line text-ink-soft hover:border-gold-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-line">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <AlertTriangle className="h-7 w-7 text-ink-soft/40" />
            <p className="text-sm text-ink-soft">Nessuna gift card in questa categoria.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-muted/50">
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Codice
                </th>
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Destinatario
                </th>
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Acquirente
                </th>
                <th className="px-4 py-3 text-right text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Importo
                </th>
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Acquistata
                </th>
                <th className="px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                  Scadenza / Riscatto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((gc) => (
                <tr key={gc.id} className="bg-paper transition-colors hover:bg-paper-muted/40">
                  <td className="px-4 py-3 font-mono text-xs tracking-wider text-ink-soft">
                    {gc.cardCode}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{gc.recipientName}</p>
                    <p className="text-xs text-ink-soft/70">{gc.recipientEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{gc.buyerName}</p>
                    <p className="text-xs text-ink-soft/70">{gc.buyerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">
                    {currency.format(gc.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium ${STATUS_STYLE[gc.status]}`}
                      >
                        {STATUS_LABEL[gc.status]}
                      </span>
                      {gc.scheduledAt && !gc.emailSentAt && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-gold">
                          <CalendarClock className="h-2.5 w-2.5" />
                          {dateShort.format(new Date(gc.scheduledAt))}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {dateShort.format(new Date(gc.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {gc.status === GiftCardStatus.REDEEMED && gc.redeemedAt
                      ? `✓ ${dateShort.format(new Date(gc.redeemedAt))}`
                      : dateShort.format(new Date(gc.expiresAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-ink-soft/50">
        {filtered.length} gift card · aggiornato alle{" "}
        {new Intl.DateTimeFormat("it-IT", { timeStyle: "short" }).format(new Date())}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border p-4 ${
        highlight
          ? "border-gold/30 bg-gold/5"
          : warn
            ? "border-amber-200 bg-amber-50"
            : "border-line bg-paper"
      }`}
    >
      <div className={`${highlight ? "text-gold" : warn ? "text-amber-600" : "text-ink-soft/60"}`}>
        {icon}
      </div>
      <p className={`text-xl font-semibold ${highlight ? "text-gold" : "text-ink"}`}>{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
