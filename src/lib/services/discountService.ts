import { DiscountScope, DiscountType, type DiscountCode } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  findGiftCardProduct,
  resolveFaceValue,
  type GiftCardProduct,
} from "@/lib/giftCardProducts";

// Stripe non accetta pagamenti sotto 0,50 €: lo sconto non scende mai sotto.
const MIN_CHARGE = 0.5;

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Rome",
});

export function normalizeDiscountCode(raw: string): string {
  return raw.trim().toUpperCase();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseProductSlugs(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export interface CheckoutQuote {
  product: GiftCardProduct;
  faceValue: number;
  discountAmount: number;
  total: number;
  discount: { id: string; code: string } | null;
}

export type QuoteResult =
  | { ok: true; quote: CheckoutQuote }
  | { ok: false; field: "product" | "amount" | "code"; error: string };

export interface QuoteInput {
  productSlug: string;
  customAmount?: number | null;
  discountCode?: string | null;
}

/** Perché un codice non è applicabile, o null se lo è. */
export function discountCodeProblem(
  code: DiscountCode,
  product: GiftCardProduct,
  faceValue: number,
  now: Date = new Date(),
): string | null {
  if (!code.active) return "Codice non valido.";
  if (now < code.startsAt) return `Questo codice sarà valido dal ${dateFormatter.format(code.startsAt)}.`;
  if (now >= code.endsAt) return `Questo codice è scaduto il ${dateFormatter.format(code.endsAt)}.`;
  if (code.maxUses != null && code.usedCount >= code.maxUses) return "Codice esaurito.";
  if (product.isTest) return "Il codice non si applica a questa gift card.";
  if (code.scope === DiscountScope.SELECTED) {
    const slugs = parseProductSlugs(code.productSlugs);
    if (!slugs.includes(product.slug)) {
      const names = slugs.map((s) => findGiftCardProduct(s)?.name).filter(Boolean);
      return names.length
        ? `Il codice vale solo per: ${names.join(", ")}.`
        : "Il codice non si applica a questa gift card.";
    }
  }
  if (code.minAmount != null && faceValue < code.minAmount.toNumber()) {
    return `Il codice vale per gift card da almeno ${code.minAmount.toNumber()} €.`;
  }
  return null;
}

export function computeDiscountAmount(code: DiscountCode, faceValue: number): number {
  const raw =
    code.type === DiscountType.PERCENT
      ? (faceValue * code.value.toNumber()) / 100
      : code.value.toNumber();
  return round2(Math.max(0, Math.min(raw, faceValue - MIN_CHARGE)));
}

/**
 * Unica fonte di verità per il prezzo: il client manda solo prodotto,
 * importo libero e codice, mai il totale.
 */
export async function quoteCheckout(input: QuoteInput): Promise<QuoteResult> {
  const product = findGiftCardProduct(input.productSlug);
  if (!product) return { ok: false, field: "product", error: "Gift card non disponibile." };

  const faceValue = resolveFaceValue(product, input.customAmount);
  if (faceValue == null) {
    return product.type === "CUSTOM"
      ? { ok: false, field: "amount", error: `Inserisci un importo tra ${product.min} € e ${product.max} €.` }
      : { ok: false, field: "amount", error: "Importo non valido." };
  }

  const rawCode = input.discountCode ? normalizeDiscountCode(input.discountCode) : "";
  if (!rawCode) {
    return { ok: true, quote: { product, faceValue, discountAmount: 0, total: faceValue, discount: null } };
  }

  const code = await prisma.discountCode.findUnique({ where: { code: rawCode } });
  if (!code) return { ok: false, field: "code", error: "Codice non valido." };

  const problem = discountCodeProblem(code, product, faceValue);
  if (problem) return { ok: false, field: "code", error: problem };

  const discountAmount = computeDiscountAmount(code, faceValue);
  return {
    ok: true,
    quote: {
      product,
      faceValue,
      discountAmount,
      total: round2(faceValue - discountAmount),
      discount: { id: code.id, code: code.code },
    },
  };
}

export interface PublicPromo {
  code: string;
  type: DiscountType;
  value: number;
  endsAt: string;
  label: string;
}

/** Codice "Mostra sul sito" attivo in questo momento, per il banner del sito vetrina. */
export async function getPublicPromo(now: Date = new Date()): Promise<PublicPromo | null> {
  const candidates = await prisma.discountCode.findMany({
    where: { active: true, isPublic: true, startsAt: { lte: now }, endsAt: { gt: now } },
    orderBy: { endsAt: "asc" },
  });
  const code = candidates.find((c) => c.maxUses == null || c.usedCount < c.maxUses);
  if (!code) return null;

  const value = code.value.toNumber();
  const amount = code.type === DiscountType.PERCENT ? `-${value}%` : `-${value} €`;
  return {
    code: code.code,
    type: code.type,
    value,
    endsAt: code.endsAt.toISOString(),
    label: `${amount} sulle gift card con il codice ${code.code} fino al ${dateFormatter.format(new Date(code.endsAt.getTime() - 1))}`,
  };
}
