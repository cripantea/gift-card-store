"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import {
  AmountSelector,
  CUSTOM_AMOUNT_MIN,
  type GiftCardDenomination,
} from "./AmountSelector";
import { GiftDetailsForm } from "./GiftDetailsForm";
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethodSelector";
import { PurchaseButton } from "./PurchaseButton";
import { PayPalCheckoutButton } from "./PayPalCheckoutButton";
import { checkoutRequestSchema, type CheckoutRequest } from "@/lib/validation/checkout";

interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

interface ApiErrorResponse {
  error: string;
}

interface BuyerFields {
  firstName: string;
  lastName: string;
  email: string;
}

interface RecipientFields {
  recipientName: string;
  recipientEmail: string;
}

export function GiftCardCheckout() {
  const router = useRouter();

  const [selectedDenomination, setSelectedDenomination] =
    useState<GiftCardDenomination | null>(50);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const [buyer, setBuyer] = useState<BuyerFields>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [recipient, setRecipient] = useState<RecipientFields>({
    recipientName: "",
    recipientEmail: "",
  });
  const [message, setMessage] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [isSubmittingStripe, setIsSubmittingStripe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const amount = isCustomAmount ? Number(customAmount) : selectedDenomination ?? 0;

  const validation = useMemo(
    () =>
      checkoutRequestSchema.safeParse({
        buyer,
        recipient: {
          ...recipient,
          customMessage: message.trim() ? message : undefined,
        },
        amount,
      }),
    [buyer, recipient, message, amount],
  );

  const payload: CheckoutRequest | null = validation.success ? validation.data : null;
  const canPurchase = !!payload && privacyAccepted && termsAccepted;

  function handleSelectDenomination(value: GiftCardDenomination) {
    setSelectedDenomination(value);
    setIsCustomAmount(false);
    setFormError(null);
  }

  function handleSelectCustom() {
    setIsCustomAmount(true);
    setFormError(null);
  }

  async function handleStripeCheckout() {
    if (!canPurchase) {
      setFormError(
        !payload
          ? "Controlla i dati inseriti: alcuni campi obbligatori non sono validi."
          : "Devi accettare la Privacy Policy e i Termini e Condizioni per procedere.",
      );
      return;
    }

    setFormError(null);
    setIsSubmittingStripe(true);

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: StripeCheckoutResponse | ApiErrorResponse = await response.json();

      if (!response.ok || !("url" in json)) {
        throw new Error("error" in json ? json.error : "Errore durante il checkout.");
      }

      window.location.href = json.url;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Errore durante il checkout.");
      setIsSubmittingStripe(false);
    }
  }

  function handlePayPalSuccess() {
    const recipientEmail = payload?.recipient.recipientEmail ?? recipient.recipientEmail;
    router.push(`/checkout/success?recipientEmail=${encodeURIComponent(recipientEmail)}`);
  }

  const showCustomAmountHint =
    isCustomAmount && customAmount !== "" && Number(customAmount) < CUSTOM_AMOUNT_MIN;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <div className="flex flex-col gap-10 rounded-3xl border border-line bg-paper-muted/60 p-6 shadow-xl shadow-ink/5 sm:p-10">
        <AmountSelector
          selected={isCustomAmount ? null : selectedDenomination}
          isCustom={isCustomAmount}
          customAmount={customAmount}
          onSelectDenomination={handleSelectDenomination}
          onSelectCustom={handleSelectCustom}
          onCustomAmountChange={(value) => {
            setCustomAmount(value);
            setFormError(null);
          }}
        />

        {showCustomAmountHint && (
          <p className="-mt-6 text-sm text-ink-soft/70">
            L&apos;importo personalizzato minimo è {CUSTOM_AMOUNT_MIN}€.
          </p>
        )}

        <hr className="border-line" />

        <GiftDetailsForm
          buyer={buyer}
          onBuyerChange={setBuyer}
          recipient={recipient}
          onRecipientChange={setRecipient}
          message={message}
          onMessageChange={setMessage}
        />

        <hr className="border-line" />

        <div className="flex flex-col gap-5">
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={(method) => {
              setPaymentMethod(method);
              setFormError(null);
            }}
          />

          {/* Riepilogo ordine */}
          {amount > 0 && (
            <div className="rounded-2xl border border-line bg-paper px-5 py-4">
              <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                Riepilogo ordine
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Gift Card MAD Vigevano</span>
                <span className="font-medium text-ink">
                  {amount.toFixed(2).replace(".", ",")} €
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                <span>Totale</span>
                <span>{amount.toFixed(2).replace(".", ",")} €</span>
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-soft/60">
                IVA inclusa · Valida 12 mesi dall&apos;acquisto · Nessuna spesa di
                spedizione
              </p>
            </div>
          )}

          {/* Consensi normativi */}
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper px-5 py-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-gold cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-ink-soft">
                Ho letto e accetto la{" "}
                <a
                  href="https://madvigevano.it/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-gold transition-colors"
                >
                  Privacy Policy
                </a>{" "}
                e autorizzo il trattamento dei miei dati personali ai sensi del
                Reg. UE 2016/679 (GDPR). *
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-gold cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-ink-soft">
                Ho letto e accetto i{" "}
                <a
                  href="https://madvigevano.it/termini-e-condizioni"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-gold transition-colors"
                >
                  Termini e Condizioni
                </a>{" "}
                di vendita. Confermo di aver preso atto che, ai sensi
                dell&apos;art. 59 co. 1 lett. o) D.Lgs. 206/2005, il diritto di
                recesso non si applica ai contenuti digitali la cui esecuzione
                inizia immediatamente dopo l&apos;acquisto. *
              </span>
            </label>
          </div>

          {formError && (
            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </p>
          )}

          {paymentMethod === "stripe" ? (
            <PurchaseButton
              amount={amount}
              disabled={!canPurchase}
              isLoading={isSubmittingStripe}
              onClick={handleStripeCheckout}
            />
          ) : (
            <PayPalCheckoutButton
              payload={payload}
              disabled={!canPurchase}
              onSuccess={handlePayPalSuccess}
              onError={setFormError}
            />
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-soft/60">
            <ShieldCheck className="h-3.5 w-3.5 text-gold/60" />
            Pagamento sicuro e crittografato · Venditore: MAD Vigevano, Via Cairoli 6, Vigevano PV
          </div>
        </div>
      </div>
    </div>
  );
}
