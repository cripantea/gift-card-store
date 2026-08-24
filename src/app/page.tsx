import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";
import { GiftCardCheckout } from "@/components/checkout/GiftCardCheckout";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <section className="border-b border-line/60">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:py-20">
          <div className="flex items-center gap-2.5">
            <span className="block h-px w-8 bg-gold-soft/60" />
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-gold">
              Gift Card
            </span>
            <span className="block h-px w-8 bg-gold-soft/60" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Regala un&apos;esperienza esclusiva
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            Scegli il valore della tua Gift Card MAD Vigevano. Il destinatario
            riceverà un&apos;email con il codice per prenotare il suo trattamento.
          </p>
        </div>
      </section>

      {/* Come funziona */}
      <section className="border-b border-line/60 bg-paper-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2.5">
              <span className="block h-px w-8 bg-gold-soft/60" />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-gold">
                Come funziona
              </span>
              <span className="block h-px w-8 bg-gold-soft/60" />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Semplice, elegante, immediato
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {/* Linea connettore desktop */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[2.75rem] hidden border-t border-dashed border-gold/25 sm:block"
              style={{ left: "calc(50%/3 + 2.75rem)", right: "calc(50%/3 + 2.75rem)" }}
            />

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-gold/30 bg-paper shadow-sm shadow-gold/10">
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-paper">
                  1
                </span>
                {/* Icon: gift */}
                <svg viewBox="0 0 48 48" className="h-9 w-9 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="20" width="36" height="24" rx="2" />
                  <rect x="4" y="12" width="40" height="8" rx="2" />
                  <line x1="24" y1="12" x2="24" y2="44" />
                  <path d="M24 12c0 0-4-8 0-8s4 8 0 8z" />
                  <path d="M24 12c0 0 4-8 0-8" />
                  <path d="M17 12c-3 0-5-2-5-4s5-4 12 4" />
                  <path d="M31 12c3 0 5-2 5-4s-5-4-12 4" />
                </svg>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink">Scegli il valore</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Acquista per te o per qualcuno di speciale. Seleziona l&apos;importo
                  e personalizza il messaggio.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-gold/30 bg-paper shadow-sm shadow-gold/10">
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-paper">
                  2
                </span>
                {/* Icon: envelope / calendar */}
                <svg viewBox="0 0 48 48" className="h-9 w-9 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="10" width="36" height="28" rx="2" />
                  <polyline points="6,10 24,26 42,10" />
                  <line x1="30" y1="32" x2="42" y2="32" />
                  <line x1="36" y1="26" x2="36" y2="38" />
                </svg>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink">Ricevi subito o dopo</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Il destinatario riceve l&apos;email immediatamente — oppure scegli
                  la data perfetta: Natale, un compleanno, un anniversario.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-gold/30 bg-paper shadow-sm shadow-gold/10">
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.6rem] font-bold text-paper">
                  3
                </span>
                {/* Icon: scissors / salon */}
                <svg viewBox="0 0 48 48" className="h-9 w-9 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="14" cy="34" r="6" />
                  <circle cx="34" cy="34" r="6" />
                  <line x1="18.5" y1="30.5" x2="29.5" y2="17.5" />
                  <line x1="29.5" y1="30.5" x2="18.5" y2="17.5" />
                  <path d="M14 28 L24 10 L34 28" />
                </svg>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-ink">Vieni in salone</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Mostra l&apos;email all&apos;ingresso di MAD Vigevano e goditi
                  la tua esperienza di bellezza.
                </p>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-xs text-ink-soft/70">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-gold/70" fill="currentColor">
                <path fillRule="evenodd" d="M10 1.944l2.43 4.926 5.44.79-3.935 3.836.929 5.417L10 13.545l-4.864 2.368.929-5.417L2.13 6.66l5.44-.79L10 1.944z" clipRule="evenodd" />
              </svg>
              Pagamento sicuro
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-soft/70">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-gold/70" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Valida 12 mesi
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-soft/70">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-gold/70" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Consegna via email immediata
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-soft/70">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-gold/70" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Invio programmato
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 sm:py-16">
        <GiftCardCheckout />
      </main>

      <footer className="border-t border-line/60 bg-paper">
        {/* Main footer body */}
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">

            {/* Colonna 1 — Brand */}
            <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
              <Image
                src={MAD_LOGO_URL}
                alt="MAD For Hair"
                width={96}
                height={96}
                className="h-24 w-24"
              />
              <div>
                <p className="font-sans text-sm font-bold tracking-widest text-ink">
                  MAD FOR HAIR
                </p>
                <a
                  href="tel:+390381644268"
                  className="mt-1 block text-sm font-medium text-gold underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  0381 644268
                </a>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-4 pt-1">
                <a
                  href="https://g.page/r/madvigevano"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/madforhairvigevano"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/madforhair_vigevano"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Colonna 2 — Aree di servizio */}
            <div className="flex flex-col gap-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                Aree di servizio
              </p>
              <p className="text-sm text-ink-soft">Vigevano</p>

              <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                Dove siamo
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Via Cairoli, 6<br />
                27029 Vigevano PV
              </p>
            </div>

            {/* Colonna 3 — Orari */}
            <div className="flex flex-col gap-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                Orari
              </p>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
                <li className="flex justify-between gap-4">
                  <span>Lunedì</span>
                  <span className="text-ink-soft/60">Chiuso</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Martedì</span>
                  <span>9:00–18:00</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Mercoledì</span>
                  <span>9:00–18:00</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Giovedì</span>
                  <span>9:00–18:00</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Venerdì</span>
                  <span>9:00–18:00</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Sabato</span>
                  <span>8:00–17:00</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gold/20">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-[0.65rem] text-ink-soft/60">
              P.IVA: 02969660188
            </p>
            <div className="flex items-center gap-6 text-[0.65rem] text-ink-soft/70">
              <a
                href="https://madvigevano.it/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-gold transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://madvigevano.it/termini-e-condizioni"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-gold transition-colors"
              >
                Termini e condizioni
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
