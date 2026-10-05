import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Condizioni di vendita Gift Card — MAD Vigevano",
  description: "Condizioni generali di vendita delle gift card MAD for Hair, con diritto di recesso di 14 giorni.",
  alternates: { canonical: "https://shop.madvigevano.it/condizioni-vendita" },
};

export default function Page() {
  return <LegalPage document="condizioni-vendita" />;
}
