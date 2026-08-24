"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Lock, Search, XCircle } from "lucide-react";
import {
  confirmGiftCardRedemption,
  lockCassa,
  lookupGiftCardCode,
  type GiftCardLookupResult,
  type RedeemGiftCardResult,
} from "@/app/cassa/actions";
import { formatCardCodeGroups, isCompleteCardCode } from "@/lib/utils/cardCode";

const amountFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "long",
  timeStyle: "short",
});

type ViewState =
  | { step: "input" }
  | { step: "session_expired" }
  | { step: "not_found" }
  | { step: "redeemed"; redeemedAt: string }
  | { step: "expired" }
  | { step: "active"; giftCardId: string; recipientName: string; amount: number }
  | { step: "success"; recipientName: string; amount: number; redeemedAt: string };

export function CassaPortal() {
  const [code, setCode] = useState("");
  const [view, setView] = useState<ViewState>({ step: "input" });
  const [isPending, startTransition] = useTransition();

  const canVerify = isCompleteCardCode(code) && !isPending;

  function handleCodeChange(raw: string) {
    setCode(formatCardCodeGroups(raw));
  }

  function handleVerify() {
    startTransition(async () => {
      const result = await lookupGiftCardCode(code);
      applyLookupResult(result);
    });
  }

  function applyLookupResult(result: GiftCardLookupResult) {
    switch (result.status) {
      case "unauthorized":
        setView({ step: "session_expired" });
        break;
      case "not_found":
        setView({ step: "not_found" });
        break;
      case "redeemed":
        setView({ step: "redeemed", redeemedAt: result.redeemedAt });
        break;
      case "expired":
        setView({ step: "expired" });
        break;
      case "active":
        setView({
          step: "active",
          giftCardId: result.giftCardId,
          recipientName: result.recipientName,
          amount: result.amount,
        });
        break;
    }
  }

  function handleConfirm(giftCardId: string, recipientName: string, amount: number) {
    startTransition(async () => {
      const result = await confirmGiftCardRedemption(giftCardId);
      applyRedeemResult(result, recipientName, amount);
    });
  }

  function applyRedeemResult(
    result: RedeemGiftCardResult,
    recipientName: string,
    amount: number,
  ) {
    switch (result.status) {
      case "unauthorized":
        setView({ step: "session_expired" });
        break;
      case "not_found":
        setView({ step: "not_found" });
        break;
      case "already_redeemed":
        setView({ step: "redeemed", redeemedAt: result.redeemedAt });
        break;
      case "expired":
        setView({ step: "expired" });
        break;
      case "success":
        setView({ step: "success", recipientName, amount, redeemedAt: result.redeemedAt });
        break;
    }
  }

  function reset() {
    setCode("");
    setView({ step: "input" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
            Cassa
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">MAD Vigevano</h1>
        </div>

        <form action={lockCassa}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-gold-soft hover:text-ink"
          >
            <Lock className="h-3.5 w-3.5" />
            Blocca
          </button>
        </form>
      </div>

      <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-line bg-paper-muted/60 p-6 shadow-xl shadow-ink/5 sm:p-8">
        {view.step === "input" && (
          <>
            <div>
              <label htmlFor="cassa-code" className="mb-2 block text-sm font-medium text-ink-soft">
                Codice Gift Card
              </label>
              <input
                id="cassa-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={code}
                onChange={(event) => handleCodeChange(event.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-5 py-5 text-center font-mono text-2xl tracking-[0.1em] text-ink outline-none focus:border-gold sm:text-3xl"
              />
            </div>

            <button
              type="button"
              disabled={!canVerify}
              onClick={handleVerify}
              className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Search className="h-4 w-4" />
              {isPending ? "Verifica in corso…" : "Verifica Codice"}
            </button>
          </>
        )}

        {view.step === "active" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-gold-soft/50 bg-gold/5 p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                Gift Card attiva
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">
                {amountFormatter.format(view.amount)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Destinatario: <span className="font-medium text-ink">{view.recipientName}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-gold-soft hover:text-ink"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleConfirm(view.giftCardId, view.recipientName, view.amount)}
                className="flex-1 rounded-full bg-ink px-6 py-3 text-base font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Conferma in corso…" : "Conferma Riscatto"}
              </button>
            </div>
          </div>
        )}

        {view.step === "success" && (
          <FeedbackBox
            tone="success"
            title="Riscatto completato!"
            description={
              <>
                {amountFormatter.format(view.amount)} riscattati per{" "}
                <strong className="font-medium">{view.recipientName}</strong>
                <br />
                {dateTimeFormatter.format(new Date(view.redeemedAt))}
              </>
            }
            onReset={reset}
          />
        )}

        {view.step === "not_found" && (
          <FeedbackBox
            tone="error"
            title="Codice non trovato"
            description="Nessuna Gift Card corrisponde al codice inserito. Controlla e riprova."
            onReset={reset}
          />
        )}

        {view.step === "redeemed" && (
          <FeedbackBox
            tone="error"
            title="Gift Card già riscattata"
            description={`Riscattata il ${dateTimeFormatter.format(new Date(view.redeemedAt))}.`}
            onReset={reset}
          />
        )}

        {view.step === "expired" && (
          <FeedbackBox
            tone="error"
            title="Gift Card scaduta"
            description="Questa Gift Card ha superato la data di validità e non può essere riscattata."
            onReset={reset}
          />
        )}

        {view.step === "session_expired" && (
          <FeedbackBox
            tone="error"
            title="Sessione scaduta"
            description="Ricarica la pagina e inserisci nuovamente il PIN per continuare."
            onReset={() => window.location.reload()}
            resetLabel="Ricarica"
          />
        )}
      </div>
    </div>
  );
}

interface FeedbackBoxProps {
  tone: "success" | "error";
  title: string;
  description: React.ReactNode;
  onReset: () => void;
  resetLabel?: string;
}

function FeedbackBox({ tone, title, description, onReset, resetLabel }: FeedbackBoxProps) {
  const isSuccess = tone === "success";

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-8 text-center ${
        isSuccess ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      ) : (
        <XCircle className="h-16 w-16 text-red-600" />
      )}

      <p
        className={`font-display text-3xl font-semibold ${
          isSuccess ? "text-emerald-800" : "text-red-800"
        }`}
      >
        {title}
      </p>

      <p className={`text-base ${isSuccess ? "text-emerald-700" : "text-red-700"}`}>
        {description}
      </p>

      <button
        type="button"
        onClick={onReset}
        className={`mt-2 rounded-full px-6 py-3 text-sm font-medium text-paper transition-colors ${
          isSuccess ? "bg-emerald-700 hover:bg-emerald-800" : "bg-red-700 hover:bg-red-800"
        }`}
      >
        {resetLabel ?? "Nuova Verifica"}
      </button>
    </div>
  );
}
