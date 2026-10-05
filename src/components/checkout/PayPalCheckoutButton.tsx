"use client";

import { useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import type { CheckoutSubmit } from "@/lib/validation/checkout";

interface PaypalOrderResponse {
  orderId: string;
}

interface ApiErrorResponse {
  error: string;
}

interface PayPalCheckoutButtonProps {
  payload: CheckoutSubmit | null;
  disabled: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const UNAVAILABLE_MESSAGE_CLASSNAME =
  "rounded-xl border border-line bg-paper-muted px-4 py-3 text-sm text-ink-soft";

export function PayPalCheckoutButton({
  payload,
  disabled,
  onSuccess,
  onError,
}: PayPalCheckoutButtonProps) {
  // L'SDK di PayPal (script, cookie e storage di terza parte) si carica solo
  // quando il cliente sceglie di pagare con PayPal, non all'apertura dello shop.
  const [isRequested, setIsRequested] = useState(false);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <p className={UNAVAILABLE_MESSAGE_CLASSNAME}>
        Il pagamento PayPal non è al momento disponibile.
      </p>
    );
  }

  if (!isRequested) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsRequested(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffc439] px-6 py-3.5 text-base font-semibold text-[#003087] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Paga con <span className="italic">PayPal</span>
      </button>
    );
  }

  return (
    <PayPalScriptProvider
      options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR", intent: "capture" }}
    >
      <PayPalButtonsWithFallback
        payload={payload}
        disabled={disabled}
        onSuccess={onSuccess}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}

function PayPalButtonsWithFallback({
  payload,
  disabled,
  onSuccess,
  onError,
}: PayPalCheckoutButtonProps) {
  const [{ isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <p className={UNAVAILABLE_MESSAGE_CLASSNAME}>
        Il pagamento PayPal non è al momento disponibile. Riprova più tardi o scegli
        Carta / Apple Pay / Google Pay.
      </p>
    );
  }

  return (
    <PayPalButtons
      disabled={disabled}
      style={{ layout: "horizontal", color: "black", shape: "pill", label: "pay" }}
      createOrder={async () => {
        if (!payload) {
          throw new Error("Completa il modulo prima di procedere con PayPal.");
        }

        const response = await fetch("/api/checkout/paypal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json: PaypalOrderResponse | ApiErrorResponse = await response.json();

        if (!response.ok || !("orderId" in json)) {
          throw new Error(
            "error" in json ? json.error : "Errore durante la creazione dell'ordine PayPal.",
          );
        }

        return json.orderId;
      }}
      onApprove={async (_data, actions) => {
        try {
          await actions.order?.capture();
          onSuccess();
        } catch {
          onError("Non è stato possibile completare il pagamento PayPal.");
        }
      }}
      onCancel={() => onError("Pagamento PayPal annullato.")}
      onError={(error) => {
        const message =
          typeof error.message === "string"
            ? error.message
            : "Si è verificato un errore con PayPal. Riprova.";
        onError(message);
      }}
    />
  );
}
