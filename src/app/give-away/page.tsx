import { GiveawayForm } from "@/components/giveaway/GiveawayForm";
import { findInviteByCode, isGiveawayOpen, sanitizeCampaign } from "@/lib/giveaway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ma è solo per te — MAD Vigevano",
  description: "Questa volta abbiamo pensato a te: una Gift Card da 50 € riservata ai nostri clienti.",
};

interface GiveawayPageProps {
  searchParams: Promise<{ src?: string | string[]; id?: string | string[] }>;
}

export default async function GiveawayPage({ searchParams }: GiveawayPageProps) {
  const { src, id } = await searchParams;
  const campaign = sanitizeCampaign(Array.isArray(src) ? src[0] : src);
  const invite = await findInviteByCode(Array.isArray(id) ? id[0] : id);

  return (
    <GiveawayForm
      campaign={campaign}
      isOpen={isGiveawayOpen()}
      invite={invite ? { code: invite.code, name: invite.name, phone: invite.phone } : null}
    />
  );
}
