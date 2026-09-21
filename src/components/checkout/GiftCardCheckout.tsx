"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import {
  AmountSelector,
  CUSTOM_AMOUNT_MIN,
  type GiftCardDenomination,
} from "./AmountSelector";
import { GiftDetailsForm, type GiftMode, type BuyerFields, type RecipientFields } from "./GiftDetailsForm";
import { PayPalCheckoutButton } from "./PayPalCheckoutButton";
import { checkoutRequestSchema, type CheckoutRequest } from "@/lib/validation/checkout";

interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

interface ApiErrorResponse {
  error: string;
}

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" as const, delay },
  };
}

export function GiftCardCheckout() {
  const router = useRouter();

  const [selectedDenomination, setSelectedDenomination] =
    useState<GiftCardDenomination | null>(50);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const [giftMode, setGiftMode] = useState<GiftMode>("self");

  const [buyer, setBuyer] = useState<BuyerFields>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [recipient, setRecipient] = useState<RecipientFields>({
    recipientFirstName: "",
    recipientLastName: "",
    recipientPhone: "",
  });
  const [message, setMessage] = useState("");

  const [isSubmittingStripe, setIsSubmittingStripe] = useState(false);
  const [activePayment, setActivePayment] = useState<"stripe" | "paypal" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");

  const amount = isCustomAmount ? Number(customAmount) : selectedDenomination ?? 0;

  const scheduledAtISO = scheduledAt
    ? new Date(scheduledAt).toISOString()
    : undefined;

  const effectiveRecipient: RecipientFields =
    giftMode === "self"
      ? {
          recipientFirstName: buyer.firstName,
          recipientLastName: buyer.lastName,
          recipientPhone: buyer.phone,
        }
      : recipient;

  const validation = useMemo(
    () =>
      checkoutRequestSchema.safeParse({
        buyer,
        recipient: {
          ...effectiveRecipient,
          customMessage: message.trim() ? message : undefined,
        },
        amount,
        scheduledAt: scheduledAtISO,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buyer, giftMode, recipient, message, amount, scheduledAtISO],
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
    const phone = payload?.recipient.recipientPhone ?? recipient.recipientPhone;
    router.push(`/checkout/success?recipientPhone=${encodeURIComponent(phone)}`);
  }

  const showCustomAmountHint =
    isCustomAmount && customAmount !== "" && Number(customAmount) < CUSTOM_AMOUNT_MIN;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-10 rounded-3xl border border-line bg-paper-muted/60 p-6 shadow-xl shadow-ink/5 sm:p-10"
      >
        <motion.div {...fadeUp(0)}>
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
        </motion.div>

        <AnimatePresence>
          {showCustomAmountHint && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="-mt-6 text-sm text-ink-soft/70"
            >
              L&apos;importo personalizzato minimo è {CUSTOM_AMOUNT_MIN}€.
            </motion.p>
          )}
        </AnimatePresence>

        <hr className="border-line" />

        <GiftDetailsForm
          giftMode={giftMode}
          onGiftModeChange={setGiftMode}
          buyer={buyer}
          onBuyerChange={setBuyer}
          recipient={recipient}
          onRecipientChange={setRecipient}
          message={message}
          onMessageChange={setMessage}
          scheduledAt={scheduledAt}
          onScheduledAtChange={setScheduledAt}
        />

        <hr className="border-line" />

        <motion.div {...fadeUp(0.28)} className="flex flex-col gap-5">
          {/* Riepilogo ordine */}
          <AnimatePresence>
            {amount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-line bg-paper px-5 py-4"
              >
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
                  IVA inclusa · Valida 12 mesi dall&apos;acquisto · Nessuna spesa di spedizione
                </p>
                {scheduledAt && (
                  <p className="mt-1 text-[0.7rem] font-medium text-gold/80">
                    WhatsApp programmato:{" "}
                    {new Date(scheduledAt).toLocaleString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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

          <AnimatePresence>
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Payment buttons */}
          <div className="flex flex-col gap-3">
            {/* Apple Pay */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              disabled={isSubmittingStripe || !canPurchase}
              onClick={() => { setActivePayment("stripe"); void handleStripeCheckout(); }}
              className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#000] px-6 py-4 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmittingStripe && activePayment === "stripe" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 814 1000" className="h-5 w-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 134.4-317.3 266.5-317.3 100.9 0 184.8 66.5 248 66.5 60 0 154.3-69.9 270.1-69.9l-45.7 120zm-234.9-228.4c51.2-60.5 90.9-144.2 90.9-228s-6.4-17.6-9.4-17.6c-44.5 3.5-107.9 58.5-157.5 121.9-46.3 59.3-90.9 152.8-90.9 241.1 0 9.4 1.6 18.8 2.2 21.7 5.1.6 13.4 1.6 21.7 1.6 40.5 0 110.3-53.6 142.9-140.7z"/>
                  </svg>
                  <span className="text-base">Pay</span>
                </>
              )}
            </motion.button>

            {/* Google Pay */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              disabled={isSubmittingStripe || !canPurchase}
              onClick={() => { setActivePayment("stripe"); void handleStripeCheckout(); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#dadce0] bg-white px-6 py-4 font-medium text-[#3c4043] shadow-sm transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmittingStripe && activePayment === "stripe" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 41 17" className="h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.996-2.583.996h-2.485zM27.194 5.054c1.094 0 1.96.297 2.596.886.636.59.954 1.402.954 2.437v4.914h-1.437v-1.11h-.065c-.616.914-1.435 1.37-2.455 1.37-.872 0-1.6-.259-2.18-.778-.582-.518-.872-1.168-.872-1.95 0-.824.311-1.48.935-1.963.623-.495 1.454-.742 2.492-.742.883 0 1.613.162 2.186.485v-.34c0-.516-.203-.955-.608-1.317-.406-.362-.884-.543-1.435-.543-.828 0-1.484.35-1.966 1.051l-1.322-.833c.724-1.045 1.797-1.567 3.177-1.567zm-1.92 5.39c0 .383.162.706.486.97.323.261.702.392 1.136.392.615 0 1.165-.23 1.648-.69.483-.46.725-.998.725-1.614-.455-.362-1.09-.543-1.905-.543-.593 0-1.086.144-1.48.435-.393.29-.61.657-.61 1.05zM36.963 5.314l-5.02 11.53H30.43l1.864-4.034-3.306-7.496h1.636l2.387 5.733h.032l2.322-5.733z" fill="#3C4043"/>
                    <path d="M14.357 7.03c0-.484-.044-.954-.127-1.41H7.32v2.666h3.945a3.373 3.373 0 01-1.462 2.211v1.836h2.366c1.384-1.276 2.188-3.153 2.188-5.303z" fill="#4285F4"/>
                    <path d="M7.32 14.518c1.98 0 3.64-.657 4.853-1.784l-2.366-1.835c-.655.44-1.494.7-2.487.7-1.912 0-3.534-1.29-4.112-3.022H.76v1.894A7.32 7.32 0 007.32 14.518z" fill="#34A853"/>
                    <path d="M3.208 9.577A4.41 4.41 0 012.98 8.2c0-.478.083-.94.228-1.378V4.928H.76A7.322 7.322 0 000 8.2c0 1.18.282 2.296.76 3.272l2.448-1.895z" fill="#FBBC04"/>
                    <path d="M7.32 3.8c1.077 0 2.043.37 2.804 1.098L12.37 2.65C10.956 1.332 9.298.575 7.32.575a7.32 7.32 0 00-6.56 4.053l2.449 1.899C3.786 5.09 5.408 3.8 7.32 3.8z" fill="#E94235"/>
                  </svg>
                  <span className="text-base font-medium">Pay</span>
                </>
              )}
            </motion.button>

            {/* Carta di credito */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              disabled={isSubmittingStripe || !canPurchase}
              onClick={() => { setActivePayment("stripe"); void handleStripeCheckout(); }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-paper px-6 py-4 text-base font-medium text-ink transition-colors hover:border-gold/60 hover:bg-paper-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmittingStripe && activePayment === "stripe" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reindirizzamento…</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <span>Carta di credito / debito</span>
                </>
              )}
            </motion.button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-ink-soft/50">oppure</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* PayPal */}
            <PayPalCheckoutButton
              payload={payload}
              disabled={!canPurchase}
              onSuccess={handlePayPalSuccess}
              onError={setFormError}
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-soft/60">
            <ShieldCheck className="h-3.5 w-3.5 text-gold/60" />
            Pagamento sicuro e crittografato · Venditore: MAD Vigevano, Via Cairoli 6, Vigevano PV
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
