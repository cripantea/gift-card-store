import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie policy — MAD Vigevano",
  description: "Cookie e strumenti simili usati su madvigevano.it e shop.madvigevano.it, e come gestire il consenso.",
  alternates: { canonical: "https://shop.madvigevano.it/cookie-policy" },
};

export default function Page() {
  return <LegalPage document="cookie" />;
}
