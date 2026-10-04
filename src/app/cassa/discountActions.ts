"use server";

import { z } from "zod";
import { DiscountScope, DiscountType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isCassaSessionValid } from "@/lib/cassaAuth";
import { DISCOUNTABLE_PRODUCTS } from "@/lib/giftCardProducts";
import { normalizeDiscountCode, parseProductSlugs } from "@/lib/services/discountService";

export interface AdminDiscountCode {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  productSlugs: string[];
  minAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  isPublic: boolean;
  ordersCount: number;
  revenue: number;
  discountGiven: number;
  createdAt: string;
}

export type DiscountListResult =
  | { authorized: false }
  | { authorized: true; codes: AdminDiscountCode[] };

export type DiscountMutationResult =
  | { ok: true }
  | { ok: false; error: string; unauthorized?: boolean };

const productSlugValues = DISCOUNTABLE_PRODUCTS.map((p) => p.slug) as [string, ...string[]];

const discountCodeInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Il codice deve avere almeno 3 caratteri.")
      .max(20, "Il codice può avere al massimo 20 caratteri.")
      .transform(normalizeDiscountCode)
      .pipe(z.string().regex(/^[A-Z0-9-]+$/, "Usa solo lettere, numeri e trattino.")),
    description: z.string().trim().max(190).optional(),
    type: z.enum(DiscountType),
    value: z.number().positive("Lo sconto deve essere maggiore di zero."),
    scope: z.enum(DiscountScope),
    productSlugs: z.array(z.enum(productSlugValues)).default([]),
    minAmount: z.number().positive().nullable().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    startsAt: z.iso.datetime({ message: "Data di inizio non valida." }),
    endsAt: z.iso.datetime({ message: "Data di scadenza non valida." }),
    active: z.boolean(),
    isPublic: z.boolean(),
  })
  .refine((d) => d.type !== DiscountType.PERCENT || d.value <= 90, {
    message: "La percentuale massima è 90%.",
    path: ["value"],
  })
  .refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
    message: "La scadenza deve essere successiva all'inizio.",
    path: ["endsAt"],
  })
  .refine((d) => d.scope !== DiscountScope.SELECTED || d.productSlugs.length > 0, {
    message: "Seleziona almeno una gift card.",
    path: ["productSlugs"],
  });

export type DiscountCodeInput = z.input<typeof discountCodeInputSchema>;

function toData(input: z.output<typeof discountCodeInputSchema>) {
  return {
    code: input.code,
    description: input.description || null,
    type: input.type,
    value: input.value,
    scope: input.scope,
    productSlugs: input.scope === DiscountScope.SELECTED ? input.productSlugs : Prisma.DbNull,
    minAmount: input.minAmount ?? null,
    maxUses: input.maxUses ?? null,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    active: input.active,
    isPublic: input.isPublic,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const UNAUTHORIZED: DiscountMutationResult = {
  ok: false,
  error: "Sessione scaduta: ricarica la pagina e inserisci il PIN.",
  unauthorized: true,
};

export async function listDiscountCodes(): Promise<DiscountListResult> {
  if (!(await isCassaSessionValid())) return { authorized: false };

  const [codes, totals] = await Promise.all([
    prisma.discountCode.findMany({ orderBy: [{ startsAt: "desc" }, { code: "asc" }] }),
    prisma.order.groupBy({
      by: ["discountCodeId"],
      where: { discountCodeId: { not: null } },
      _count: { _all: true },
      _sum: { totalAmount: true, discountAmount: true },
    }),
  ]);
  const byCode = new Map(totals.map((t) => [t.discountCodeId, t]));

  return {
    authorized: true,
    codes: codes.map((c) => {
      const t = byCode.get(c.id);
      return {
        id: c.id,
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value.toNumber(),
        scope: c.scope,
        productSlugs: parseProductSlugs(c.productSlugs),
        minAmount: c.minAmount?.toNumber() ?? null,
        maxUses: c.maxUses,
        usedCount: c.usedCount,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
        active: c.active,
        isPublic: c.isPublic,
        ordersCount: t?._count._all ?? 0,
        revenue: t?._sum.totalAmount?.toNumber() ?? 0,
        discountGiven: t?._sum.discountAmount?.toNumber() ?? 0,
        createdAt: c.createdAt.toISOString(),
      };
    }),
  };
}

export async function createDiscountCode(input: DiscountCodeInput): Promise<DiscountMutationResult> {
  if (!(await isCassaSessionValid())) return UNAUTHORIZED;

  const parsed = discountCodeInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };

  try {
    await prisma.discountCode.create({ data: toData(parsed.data) });
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `Il codice ${parsed.data.code} esiste già.` };
    console.error("Creazione codice sconto fallita", error);
    return { ok: false, error: "Salvataggio non riuscito." };
  }
}

export async function updateDiscountCode(
  id: string,
  input: DiscountCodeInput,
): Promise<DiscountMutationResult> {
  if (!(await isCassaSessionValid())) return UNAUTHORIZED;

  const parsed = discountCodeInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Codice non trovato." };
  // Gli ordini salvano già una copia del testo, ma rinominare un codice usato confonde i report.
  if (existing.usedCount > 0 && existing.code !== parsed.data.code) {
    return { ok: false, error: "Il codice è già stato usato: non si può rinominare. Creane uno nuovo." };
  }

  try {
    await prisma.discountCode.update({ where: { id }, data: toData(parsed.data) });
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `Il codice ${parsed.data.code} esiste già.` };
    console.error("Modifica codice sconto fallita", error);
    return { ok: false, error: "Salvataggio non riuscito." };
  }
}

/**
 * Gli ordini già pagati con questo codice restano invariati: perdono il
 * collegamento (onDelete: SetNull) ma conservano il testo del codice e lo sconto.
 */
export async function deleteDiscountCode(id: string): Promise<DiscountMutationResult> {
  if (!(await isCassaSessionValid())) return UNAUTHORIZED;

  try {
    await prisma.discountCode.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    console.error("Eliminazione codice sconto fallita", error);
    return { ok: false, error: "Eliminazione non riuscita." };
  }
}
