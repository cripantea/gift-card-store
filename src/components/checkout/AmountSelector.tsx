import { Check } from "lucide-react";

export const GIFT_CARD_DENOMINATIONS = [50, 100, 150, 200] as const;

export type GiftCardDenomination = (typeof GIFT_CARD_DENOMINATIONS)[number];

export const CUSTOM_AMOUNT_MIN = 50;

interface AmountSelectorProps {
  selected: GiftCardDenomination | null;
  isCustom: boolean;
  customAmount: string;
  onSelectDenomination: (value: GiftCardDenomination) => void;
  onSelectCustom: () => void;
  onCustomAmountChange: (value: string) => void;
}

export function AmountSelector({
  selected,
  isCustom,
  customAmount,
  onSelectDenomination,
  onSelectCustom,
  onCustomAmountChange,
}: AmountSelectorProps) {
  return (
    <fieldset>
      <legend className="font-display text-2xl font-semibold text-ink">
        Scegli il taglio
      </legend>
      <p className="mt-1 text-sm text-ink-soft/80">
        Seleziona un importo oppure inserisci quello che preferisci.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GIFT_CARD_DENOMINATIONS.map((value) => {
          const isSelected = !isCustom && selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectDenomination(value)}
              aria-pressed={isSelected}
              className={`relative flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border text-lg font-medium transition-all ${
                isSelected
                  ? "border-gold bg-ink text-paper shadow-lg shadow-ink/10"
                  : "border-line bg-paper text-ink hover:border-gold-soft hover:bg-paper-muted"
              }`}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-paper">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <span className="font-display text-2xl">{value}€</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSelectCustom}
        aria-pressed={isCustom}
        className={`mt-3 flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
          isCustom
            ? "border-gold bg-ink text-paper shadow-lg shadow-ink/10"
            : "border-line bg-paper text-ink hover:border-gold-soft hover:bg-paper-muted"
        }`}
      >
        <span className="font-medium">Importo personalizzato</span>
        <span className={`text-sm ${isCustom ? "text-sand" : "text-ink-soft/70"}`}>
          minimo {CUSTOM_AMOUNT_MIN}€
        </span>
      </button>

      {isCustom && (
        <div className="mt-3">
          <label htmlFor="custom-amount" className="sr-only">
            Importo personalizzato in euro
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 focus-within:border-gold">
            <input
              id="custom-amount"
              type="number"
              inputMode="decimal"
              min={CUSTOM_AMOUNT_MIN}
              step={1}
              placeholder="Es. 75"
              value={customAmount}
              onChange={(event) => onCustomAmountChange(event.target.value)}
              className="w-full bg-transparent text-lg font-medium text-ink outline-none placeholder:text-ink-soft/40"
            />
            <span className="text-lg font-medium text-ink-soft">€</span>
          </div>
        </div>
      )}
    </fieldset>
  );
}
