import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAD Vigevano — Gift Card",
  description:
    "Regala un'esperienza di bellezza e benessere esclusiva con la Gift Card MAD Vigevano.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
