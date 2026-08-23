"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
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
    if (!payload) {
      setFormError("Controlla i dati inseriti: alcuni campi obbligatori non sono validi.");
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

          {formError && (
            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </p>
          )}

          {paymentMethod === "stripe" ? (
            <PurchaseButton
              amount={amount}
              disabled={!payload}
              isLoading={isSubmittingStripe}
              onClick={handleStripeCheckout}
            />
          ) : (
            <PayPalCheckoutButton
              payload={payload}
              disabled={!payload}
              onSuccess={handlePayPalSuccess}
              onError={setFormError}
            />
          )}

          <p className="text-center text-xs text-ink-soft/60">
            Pagamento sicuro e crittografato · La Gift Card è valida 12 mesi dalla data di
            acquisto.
          </p>
        </div>
      </div>
    </div>
  );
}
