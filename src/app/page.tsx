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
