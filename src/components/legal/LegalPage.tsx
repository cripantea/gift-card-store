import Link from "next/link";
import { renderLegalDocument, type LegalDocument } from "@/lib/legal";

interface LegalPageProps {
  document: LegalDocument;
}

/** Pagina con un testo legale di src/content/legal (contenuto statico, non inserito dagli utenti). */
export function LegalPage({ document }: LegalPageProps) {
  return (
    <main className="flex-1 bg-paper px-5 py-12 sm:py-16">
      <article
        className="legal-doc mx-auto max-w-3xl"
        dangerouslySetInnerHTML={{ __html: renderLegalDocument(document) }}
      />
      <p className="mx-auto mt-12 max-w-3xl text-sm">
        <Link href="/" className="text-gold underline underline-offset-2">
          ← Torna allo shop
        </Link>
      </p>
    </main>
  );
}
