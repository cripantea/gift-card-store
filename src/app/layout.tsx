import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MAD Vigevano — Gift Card",
  description:
    "Regala un'esperienza di bellezza e benessere esclusiva con la Gift Card MAD Vigevano.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
