import { NextResponse } from "next/server";
import { getPublicPromo, type PublicPromo } from "@/lib/services/discountService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Letto dal sito vetrina (madvigevano.it) per il banner promo: dati pubblici.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300",
};

export async function GET(): Promise<NextResponse<{ promo: PublicPromo | null }>> {
  const promo = await getPublicPromo().catch((error: unknown) => {
    console.error("Lettura promo pubblica fallita", error);
    return null;
  });
  return NextResponse.json({ promo }, { headers: CORS_HEADERS });
}

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
