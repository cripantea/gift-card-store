import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Regolamento Give Away — MAD Vigevano",
  description: "Regolamento del Give Away Ma è solo per te di MAD for Hair.",
  alternates: { canonical: "https://shop.madvigevano.it/regolamento-give-away" },
};

export default function Page() {
  return <LegalPage document="regolamento-give-away" />;
}
