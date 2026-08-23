import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UnwrappingExperience } from "@/components/gift/UnwrappingExperience";
import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";

export const runtime = "nodejs";

interface GiftPageProps {
  params: Promise<{ token: string }>;
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { token } = await params;

  const giftCard = await prisma.giftCard.findUnique({
    where: { secretToken: token },
    include: { order: { include: { customer: true } } },
  });

  if (!giftCard) {
    notFound();
  }

  const card = (
    <VirtualGiftCard
      amount={giftCard.amount.toNumber()}
      recipientName={giftCard.recipientName}
      buyerFullName={`${giftCard.order.customer.firstName} ${giftCard.order.customer.lastName}`}
      customMessage={giftCard.customMessage}
      cardCode={giftCard.cardCode}
      expiresAt={giftCard.expiresAt}
    />
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-12 sm:py-20">
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/50 bg-gold/5 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
          <Sparkles className="h-3 w-3" />
          Gift Card
        </span>
        <p className="font-display text-2xl font-semibold text-ink">MÀD Vigevano</p>
      </div>

      <div className="w-full max-w-md">
        {giftCard.isOpened ? (
          card
        ) : (
          <UnwrappingExperience secretToken={giftCard.secretToken}>{card}</UnwrappingExperience>
        )}
      </div>
    </div>
  );
}
