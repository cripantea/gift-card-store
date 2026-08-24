import Image from "next/image";
import Link from "next/link";
import { MAD_LOGO_URL } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="bg-paper border-b border-line/60">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-6 py-4 sm:py-5">
        <Link
          href="/"
          aria-label="Torna alla home di MAD Vigevano"
          className="transition-opacity hover:opacity-75"
        >
          <Image
            src={MAD_LOGO_URL}
            alt="MAD Vigevano"
            width={120}
            height={120}
            priority
            className="h-24 w-24 sm:h-[120px] sm:w-[120px]"
          />
        </Link>
      </div>
    </header>
  );
}
