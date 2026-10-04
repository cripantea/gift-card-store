import { NextResponse } from "next/server";
import { quoteCheckout } from "@/lib/services/discountService";
import { discountValidateRequestSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

export interface DiscountValidateResponse {
  code: string;
  faceValue: number;
  discountAmount: number;
  total: number;
}

interface ApiErrorResponse {
  error: string;
}

// Limite semplice contro i tentativi a raffica di indovinare codici:
// 10 richieste al minuto per IP, in memoria del singolo processo.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

export async function POST(
  request: Request,
): Promise<NextResponse<DiscountValidateResponse | ApiErrorResponse>> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra un minuto." }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = discountValidateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Inserisci un codice valido." }, { status: 400 });
  }

  const result = await quoteCheckout(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { quote } = result;
  return NextResponse.json({
    code: quote.discount?.code ?? "",
    faceValue: quote.faceValue,
    discountAmount: quote.discountAmount,
    total: quote.total,
  });
}
