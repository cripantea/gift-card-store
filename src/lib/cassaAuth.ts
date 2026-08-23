import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "cassa_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const pin = process.env.CASSA_PIN ?? "1234";
  return `mad-vigevano-cassa:${pin}`;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", getSessionSecret()).update(String(expiresAt)).digest("hex");
}

function buildSessionToken(expiresAt: number): string {
  return `${expiresAt}.${sign(expiresAt)}`;
}

function isValidSessionToken(token: string): boolean {
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const expected = Buffer.from(sign(expiresAt), "hex");
  const provided = Buffer.from(signature, "hex");
  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function isValidCassaPin(pin: string): boolean {
  const expectedPin = process.env.CASSA_PIN ?? "1234";
  return pin.length === 4 && pin === expectedPin;
}

export async function createCassaSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, buildSessionToken(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/cassa",
    expires: new Date(expiresAt),
  });
}

export async function isCassaSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? isValidSessionToken(token) : false;
}

export async function clearCassaSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
