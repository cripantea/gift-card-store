import Link from "next/link";
import { COMPANY } from "@/lib/company";

/** Dati societari e link legali in fondo a tutte le pagine dello shop. */
export function LegalFooter() {
  return (
    <footer className="border-t border-gold/20 bg-paper">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-6 text-center text-[0.7rem] leading-relaxed text-ink-soft/80">
        <p>
          {COMPANY.ragioneSociale} · {COMPANY.insegna} · Sede legale {COMPANY.sedeLegale} · Salone{" "}
          {COMPANY.sedeOperativa} · P.IVA e C.F. {COMPANY.piva} · Tel.{" "}
          <a href={`tel:${COMPANY.telefonoHref}`} className="hover:text-gold">
            {COMPANY.telefono}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${COMPANY.email}`} className="hover:text-gold">
            {COMPANY.email}
          </a>
        </p>
        <nav aria-label="Informazioni legali" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-medium">
          <Link href="/condizioni-vendita" className="hover:text-gold">Condizioni di vendita</Link>
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/cookie-policy" className="hover:text-gold">Cookie policy</Link>
          <Link href="/regolamento-give-away" className="hover:text-gold">Regolamento Give Away</Link>
          <a href="#preferenze-cookie" data-mad-consent-open="" className="hover:text-gold">
            Preferenze cookie
          </a>
          <a href={COMPANY.sito} className="hover:text-gold">madvigevano.it</a>
        </nav>
      </div>
    </footer>
  );
}
