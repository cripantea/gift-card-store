import { CreditCard, Wallet } from "lucide-react";

export type PaymentMethod = "stripe" | "paypal";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset>
      <legend className="font-display text-2xl font-semibold text-ink">
        Metodo di pagamento
      </legend>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={value === "stripe"}
          onClick={() => onChange("stripe")}
          className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
            value === "stripe"
              ? "border-gold bg-ink text-paper shadow-lg shadow-ink/10"
              : "border-line bg-paper text-ink hover:border-gold-soft hover:bg-paper-muted"
          }`}
        >
          <CreditCard className="h-5 w-5 shrink-0" />
          <span>
            <span className="block font-medium">Carta / Apple Pay / Google Pay</span>
            <span
              className={`block text-xs ${
                value === "stripe" ? "text-sand" : "text-ink-soft/70"
              }`}
            >
              Pagamento sicuro con Stripe
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={value === "paypal"}
          onClick={() => onChange("paypal")}
          className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
            value === "paypal"
              ? "border-gold bg-ink text-paper shadow-lg shadow-ink/10"
              : "border-line bg-paper text-ink hover:border-gold-soft hover:bg-paper-muted"
          }`}
        >
          <Wallet className="h-5 w-5 shrink-0" />
          <span>
            <span className="block font-medium">PayPal</span>
            <span
              className={`block text-xs ${
                value === "paypal" ? "text-sand" : "text-ink-soft/70"
              }`}
            >
              Paga con il tuo account PayPal
            </span>
          </span>
        </button>
      </div>
    </fieldset>
  );
}
