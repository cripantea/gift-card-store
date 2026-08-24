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

      <footer className="border-t border-line/60 bg-paper-muted/40">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <p className="font-display text-lg font-semibold text-ink">MAD Vigevano</p>
              <p className="text-xs leading-relaxed text-ink-soft">
                Via Cairoli, 6<br />
                27029 Vigevano PV, Italia
              </p>
              <p className="text-xs text-ink-soft">
                Tel.{" "}
                <a href="tel:+390381644268" className="hover:text-gold transition-colors">
                  0381 644268
                </a>
              </p>
            </div>

            {/* Informative legali */}
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                Informazioni legali
              </p>
              <ul className="flex flex-col gap-2 text-xs text-ink-soft">
                <li>
                  <a
                    href="https://madvigevano.it/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://madvigevano.it/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://madvigevano.it/termini-e-condizioni"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Termini e Condizioni
                  </a>
                </li>
                <li>
                  <a
                    href="https://madvigevano.it/diritto-di-recesso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Diritto di Recesso
                  </a>
                </li>
              </ul>
            </div>

            {/* Note legali */}
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                Note
              </p>
              <p className="text-xs leading-relaxed text-ink-soft">
                La Gift Card è valida 12 mesi dalla data di acquisto e non è
                rimborsabile. Ai sensi dell&apos;art. 59 co. 1 lett. o) del Codice
                del Consumo, il diritto di recesso non si applica ai contenuti
                digitali la cui esecuzione è iniziata previo consenso del consumatore.
              </p>
              {/* TODO: inserire P.IVA — es. P.IVA 00000000000 */}
            </div>
          </div>

          <div className="mt-10 border-t border-line/60 pt-6">
            <p className="text-center text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft/50">
              © {new Date().getFullYear()} MAD Vigevano — Tutti i diritti riservati
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
