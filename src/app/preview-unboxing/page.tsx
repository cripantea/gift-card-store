import { UnwrappingExperience } from "@/components/gift/UnwrappingExperience";
import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";
import { CardScene } from "@/components/gift/CardScene";

export default function PreviewUnboxingPage() {
  const card = (
    <CardScene skipEntrance>
      <VirtualGiftCard
        amount={150}
        recipientName="Sofia"
        buyerFullName="Marco Rossi"
        customMessage="Con tutto il mio affetto, buon compleanno!"
        cardCode="MAD-2024-XKQP-7831"
        expiresAt={new Date("2025-12-31")}
      />
    </CardScene>
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <UnwrappingExperience secretToken="preview-no-op">{card}</UnwrappingExperience>
      </div>
    </div>
  );
}
