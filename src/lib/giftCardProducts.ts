// Catalogo delle gift card acquistabili. Lo slug è usato nei link del sito
// vetrina (shop.madvigevano.it/?prodotto=gc-100) e nell'ambito dei codici sconto.

export type GiftCardProductType = "FIXED" | "CUSTOM";

interface GiftCardProductBase {
  slug: string;
  name: string;
  /** Taglio tecnico per i pagamenti di prova: mai scontabile, nascosto nell'admin. */
  isTest?: boolean;
}

export interface FixedGiftCardProduct extends GiftCardProductBase {
  type: "FIXED";
  value: number;
}

export interface CustomGiftCardProduct extends GiftCardProductBase {
  type: "CUSTOM";
  min: number;
  max: number;
}

export type GiftCardProduct = FixedGiftCardProduct | CustomGiftCardProduct;

export const GIFT_CARD_PRODUCTS: readonly GiftCardProduct[] = [
  { slug: "gc-test", name: "Test 0,10 €", type: "FIXED", value: 0.1, isTest: true },
  { slug: "gc-50", name: "Gift Card 50 €", type: "FIXED", value: 50 },
  { slug: "gc-100", name: "Gift Card 100 €", type: "FIXED", value: 100 },
  { slug: "gc-150", name: "Gift Card 150 €", type: "FIXED", value: 150 },
  { slug: "gc-200", name: "Gift Card 200 €", type: "FIXED", value: 200 },
  { slug: "gc-libera", name: "Importo personalizzato", type: "CUSTOM", min: 50, max: 1000 },
];

export const DEFAULT_PRODUCT_SLUG = "gc-50";
export const CUSTOM_PRODUCT_SLUG = "gc-libera";

/** Prodotti selezionabili come ambito di un codice sconto. */
export const DISCOUNTABLE_PRODUCTS = GIFT_CARD_PRODUCTS.filter((p) => !p.isTest);

export function findGiftCardProduct(slug: string | null | undefined): GiftCardProduct | null {
  if (!slug) return null;
  return GIFT_CARD_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getProductName(slug: string | null | undefined): string {
  return findGiftCardProduct(slug)?.name ?? "Gift Card";
}

/**
 * Valore nominale della card per il prodotto scelto, o null se l'importo
 * libero è fuori dai limiti.
 */
export function resolveFaceValue(product: GiftCardProduct, customAmount?: number | null): number | null {
  if (product.type === "FIXED") return product.value;
  if (customAmount == null || !Number.isFinite(customAmount)) return null;
  const rounded = Math.round(customAmount * 100) / 100;
  return rounded >= product.min && rounded <= product.max ? rounded : null;
}
