import { GiveawayForm } from "@/components/giveaway/GiveawayForm";
import { isGiveawayOpen, sanitizeCampaign } from "@/lib/giveaway";

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

  return <GiveawayForm campaign={campaign} isOpen={isGiveawayOpen()} />;
}
