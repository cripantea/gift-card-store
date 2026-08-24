import Image from "next/image";
import Link from "next/link";
import { MAD_LOGO_URL } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="bg-paper border-b border-line/60">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-6 py-5 sm:py-6">
        <Link
          href="/"
          aria-label="Torna alla home di MÀD Vigevano"
          className="flex items-center gap-4 group"
        >
          <Image
            src={MAD_LOGO_URL}
            alt="MÀD Vigevano"
            width={72}
            height={72}
            priority
            className="h-16 w-16 sm:h-[72px] sm:w-[72px] transition-opacity group-hover:opacity-80"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              MÀD
            </span>
            <span className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.25em] text-ink-soft mt-0.5">
              Vigevano
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
