import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";
import { CardScene } from "@/components/gift/CardScene";

export default function PreviewCardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md">
        <CardScene>
          <VirtualGiftCard
            amount={150}
            recipientName="Sofia"
            buyerFullName="Marco Rossi"
            customMessage="Con tutto il mio affetto, buon compleanno!"
            cardCode="MAD-2024-XKQP-7831"
            expiresAt={new Date("2025-12-31")}
          />
        </CardScene>
      </div>
    </div>
  );
}
