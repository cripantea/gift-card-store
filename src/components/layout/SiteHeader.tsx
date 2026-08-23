import Image from "next/image";
import Link from "next/link";
import { MAD_LOGO_URL } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-6 py-3">
        <Link href="/" aria-label="Torna alla home di MÀD Vigevano">
          <Image
            src={MAD_LOGO_URL}
            alt="MÀD Vigevano"
            width={56}
            height={56}
            priority
            className="h-12 w-12 sm:h-14 sm:w-14"
          />
        </Link>
      </div>
    </header>
  );
}
