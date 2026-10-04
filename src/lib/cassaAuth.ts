import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "cassa_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

/**
 * Chiave di firma della sessione. NON deriva solo dal PIN: con 4 cifre un
 * attaccante potrebbe provare le 10.000 chiavi forgiando cookie senza mai
 * passare dal blocco dei tentativi. Cambiare il PIN invalida le sessioni.
 */
function getSessionSecret(): string {
  const secret = process.env.CASSA_SESSION_SECRET ?? process.env.DATABASE_URL ?? "";
  return `mad-vigevano-cassa:${secret}:${process.env.CASSA_PIN ?? ""}`;
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

// ─── Blocco dei tentativi (in memoria: si azzera al riavvio del processo) ─────
const MAX_FAILURES_PER_IP = 5;
const MAX_FAILURES_GLOBAL = 30;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failuresByIp = new Map<string, number[]>();
let globalFailures: number[] = [];

function recent(times: number[], now: number): number[] {
  return times.filter((t) => now - t < FAILURE_WINDOW_MS);
}

/** Minuti di attesa se l'IP (o l'insieme dei tentativi) ha sbagliato troppe volte, altrimenti 0. */
export function cassaLockoutMinutes(ip: string): number {
  const now = Date.now();
  globalFailures = recent(globalFailures, now);
  const ipFailures = recent(failuresByIp.get(ip) ?? [], now);
  failuresByIp.set(ip, ipFailures);

  const blockedBy =
    ipFailures.length >= MAX_FAILURES_PER_IP ? ipFailures : globalFailures.length >= MAX_FAILURES_GLOBAL ? globalFailures : null;
  if (!blockedBy) return 0;
  return Math.max(1, Math.ceil((FAILURE_WINDOW_MS - (now - blockedBy[0])) / 60_000));
}

export function registerCassaFailure(ip: string): void {
  const now = Date.now();
  failuresByIp.set(ip, [...recent(failuresByIp.get(ip) ?? [], now), now]);
  globalFailures = [...recent(globalFailures, now), now];
}

export function clearCassaFailures(ip: string): void {
  failuresByIp.delete(ip);
}

export function isValidCassaPin(pin: string): boolean {
  // Nessun PIN di default: se CASSA_PIN non è impostato la cassa resta chiusa.
  const expectedPin = process.env.CASSA_PIN;
  if (!expectedPin || pin.length !== expectedPin.length) return false;
  return timingSafeEqual(Buffer.from(pin), Buffer.from(expectedPin));
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
