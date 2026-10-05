import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Informativa privacy — MAD Vigevano",
  description: "Come MAD S.r.l.s. tratta i dati personali di chi visita il sito, acquista una gift card o partecipa al Give Away.",
  alternates: { canonical: "https://shop.madvigevano.it/privacy" },
};

export default function Page() {
  return <LegalPage document="privacy" />;
}
