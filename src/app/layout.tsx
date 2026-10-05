import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAD Vigevano — Gift Card",
  description:
    "Regala un'esperienza di bellezza e benessere esclusiva con la Gift Card MAD Vigevano.",
};

// Categorie facoltative del banner cookie (public/mad-consent.js). Lo shop usa
// solo cookie tecnici più il contatore statistico del Give Away.
const CONSENT_CONFIG = {
  policyUrl: "/cookie-policy",
  privacyUrl: "/privacy",
  necessaryDescription:
    "Ricordano le tue scelte sui cookie, il regalo del Give Away e la sessione dell'area cassa; i cookie di Stripe e PayPal vengono caricati solo quando scegli di pagare.",
  categories: [
    {
      id: "statistics",
      title: "Statistiche",
      description:
        "Un codice casuale salvato nel browser (mad_giveaway_visitor) ci permette di contare quante persone diverse aprono la pagina del Give Away. Non sappiamo chi sei e il dato non viene incrociato con altri.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full">
      <head>
        {/* Stesso foglio di stile del banner usato dal sito vetrina (public/). */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/mad-consent.css" />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Script id="mad-consent-config" strategy="beforeInteractive">
          {`window.MAD_CONSENT_CONFIG = ${JSON.stringify(CONSENT_CONFIG)};`}
        </Script>
        <Script src="/mad-consent.js" strategy="afterInteractive" />
        <SiteHeader />
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
