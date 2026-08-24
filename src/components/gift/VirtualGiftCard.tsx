import Image from "next/image";
import { MAD_LOGO_URL } from "@/lib/brand";

interface VirtualGiftCardProps {
  amount: number;
  recipientName: string;
  buyerFullName: string;
  customMessage: string | null;
  cardCode: string;
  expiresAt: Date;
}

const amountFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const expiryFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function VirtualGiftCard({
  amount,
  recipientName,
  buyerFullName,
  customMessage,
  cardCode,
  expiresAt,
}: VirtualGiftCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* The tessera itself: fixed credit-card proportions, exactly like the
          physical MÀD card — logo, amount, recipient/buyer, embossed code,
          expiry. Nothing here is allowed to grow the box, since aspect-ratio
          on a plain block clips overflow instead of expanding for content. */}
      <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-50 p-4 shadow-2xl sm:p-6">
        {/* Satin sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_28%,rgba(255,255,255,0.75)_46%,transparent_64%)]" />
        {/* Soft gold corner glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <Image
            src={MAD_LOGO_URL}
            alt="MAD Vigevano"
            width={56}
            height={56}
            className="h-9 w-9 drop-shadow-sm sm:h-11 sm:w-11"
          />
          <p className="mt-1.5 text-[0.55rem] font-medium uppercase tracking-[0.3em] text-neutral-400 sm:text-[0.6rem]">
            Gift Card
          </p>
          <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {amountFormatter.format(amount)}
          </p>
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-3 font-display sm:mt-4">
          <div>
            <p className="text-[0.55rem] font-sans uppercase tracking-[0.2em] text-neutral-400 sm:text-[0.6rem]">
              Per
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-ink sm:text-base">
              {recipientName}
            </p>
          </div>
          <div>
            <p className="text-[0.55rem] font-sans uppercase tracking-[0.2em] text-neutral-400 sm:text-[0.6rem]">
              Da
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-ink sm:text-base">
              {buyerFullName}
            </p>
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-neutral-200 pt-3 sm:mt-4">
          <div>
            <p className="text-[0.55rem] font-sans uppercase tracking-[0.2em] text-neutral-400 sm:text-[0.6rem]">
              Codice
            </p>
            <p className="text-emboss-gold mt-0.5 font-mono text-sm font-semibold tracking-[0.1em] sm:text-lg">
              {cardCode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.55rem] font-sans uppercase tracking-[0.2em] text-neutral-400 sm:text-[0.6rem]">
              Valida fino al
            </p>
            <p className="mt-0.5 text-xs font-medium text-neutral-600 sm:text-sm">
              {expiryFormatter.format(expiresAt)}
            </p>
          </div>
        </div>
      </div>

      {/* The physical card never carried a personal message — real ones come
          with a separate note. We do the same: the dedica lives on its own
          card right under the tessera, instead of squeezing (and clipping)
          it inside the fixed credit-card proportions above. */}
      {customMessage && (
        <p className="rounded-xl border border-neutral-200/60 bg-neutral-50 px-4 py-3 font-display text-sm italic leading-relaxed text-neutral-600 shadow-sm">
          &ldquo;{customMessage}&rdquo;
        </p>
      )}
    </div>
  );
}
