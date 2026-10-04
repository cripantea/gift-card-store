import { cookies } from "next/headers";
import { GiveawayForm } from "@/components/giveaway/GiveawayForm";
import { GiveawayVisitTracker } from "@/components/giveaway/GiveawayVisitTracker";
import { GiveawayWelcomeBack } from "@/components/giveaway/GiveawayWelcomeBack";
import { GIVEAWAY_COOKIE, findEntryBySecretToken, isGiveawayOpen, sanitizeCampaign } from "@/lib/giveaway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ma è solo per te — MAD Vigevano",
  description: "Questa volta abbiamo pensato a te: una Gift Card da 50 € riservata ai nostri clienti.",
};

interface GiveawayPageProps {
  searchParams: Promise<{ src?: string | string[] }>;
}

export default async function GiveawayPage({ searchParams }: GiveawayPageProps) {
  const { src } = await searchParams;
  const campaign = sanitizeCampaign(Array.isArray(src) ? src[0] : src);

  // Ha già compilato il form da questo telefono: niente form, direttamente il suo regalo.
  const cookieStore = await cookies();
  const entry = await findEntryBySecretToken(cookieStore.get(GIVEAWAY_COOKIE)?.value);
  if (entry) {
    return (
      <>
        <GiveawayVisitTracker />
        <GiveawayWelcomeBack firstName={entry.firstName} secretToken={entry.giftCard.secretToken} />
      </>
    );
  }

  return (
    <>
      <GiveawayVisitTracker />
      <GiveawayForm campaign={campaign} isOpen={isGiveawayOpen()} />
    </>
  );
}
