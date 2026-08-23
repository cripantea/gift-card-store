import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  amount: number;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function PurchaseButton({
  amount,
  disabled,
  isLoading,
  onClick,
}: PurchaseButtonProps) {
  const formattedAmount = amount.toFixed(2).replace(".", ",");

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading
        ? "Reindirizzamento al pagamento…"
        : `Acquista Gift Card MÀD (${formattedAmount} €)`}
    </button>
  );
}
