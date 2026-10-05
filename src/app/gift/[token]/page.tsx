import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UnwrappingExperience } from "@/components/gift/UnwrappingExperience";
import { VirtualGiftCard } from "@/components/gift/VirtualGiftCard";
import { CardScene } from "@/components/gift/CardScene";
import { GIVEAWAY_PRODUCT_SLUG } from "@/lib/giveaway";
import { GIVEAWAY_THANK_YOU } from "@/lib/giveawayOptions";

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

  const isGiveaway = giftCard.order.productSlug === GIVEAWAY_PRODUCT_SLUG;

  // Gift acquistate: l'unboxing riparte a ogni apertura del link.
  // Giveaway: dopo la prima apertura si mostra direttamente la card.
  const showUnboxing = !isGiveaway || !giftCard.isOpened;

  const card = (
    <VirtualGiftCard
      amount={giftCard.amount.toNumber()}
      recipientName={`${giftCard.recipientFirstName} ${giftCard.recipientLastName}`.trim()}
      buyerFullName={
        isGiveaway ? "MAD Vigevano" : `${giftCard.order.customer.firstName} ${giftCard.order.customer.lastName}`
      }
      customMessage={giftCard.customMessage}
      cardCode={giftCard.cardCode}
      expiresAt={giftCard.expiresAt}
    />
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-6 py-12 sm:py-16">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/50 bg-gold/5 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
          <Sparkles className="h-3 w-3" />
          Gift Card
        </span>
        <p className="font-display text-2xl font-semibold text-ink">MAD Vigevano</p>
        {isGiveaway && giftCard.isOpened && (
          <p className="mt-2 max-w-sm font-display text-lg italic leading-snug text-gold">{GIVEAWAY_THANK_YOU}</p>
        )}
      </div>

      <div className="w-full max-w-md">
        {!showUnboxing ? (
          // Card already opened: full GSAP hero entrance + idle + parallax
          <CardScene>{card}</CardScene>
        ) : (
          // Not yet opened: UnwrappingExperience handles the dramatic entrance;
          // CardScene provides idle float + parallax + shimmer after reveal.
          <UnwrappingExperience
            secretToken={giftCard.secretToken}
            subtitle={isGiveaway ? "Solo per te, che sei già nostra cliente: una Gift Card MAD da 50 €." : undefined}
            revealMessage={isGiveaway ? GIVEAWAY_THANK_YOU : undefined}
          >
            <CardScene skipEntrance>{card}</CardScene>
          </UnwrappingExperience>
        )}
      </div>
    </div>
  );
}
