import "server-only";
import { readFileSync } from "fs";
import path from "path";
import { COMPANY } from "@/lib/company";

// Testi legali (privacy, cookie, condizioni di vendita, regolamento Give Away,
// termini del sito vetrina) in src/content/legal: unica fonte anche per le
// pagine del sito madvigevano.it, generate dallo script _legal.py del mirror.

export type LegalDocument =
  | "privacy"
  | "cookie"
  | "condizioni-vendita"
  | "regolamento-give-away";

export function renderLegalDocument(name: LegalDocument): string {
  const raw = readFileSync(path.join(process.cwd(), "src/content/legal", `${name}.html`), "utf8");
  return raw.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
    const value = (COMPANY as Record<string, string>)[key];
    return value ?? match;
  });
}
