import { randomInt } from "crypto";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const sequence = randomInt(0, 100_000).toString().padStart(5, "0");
  return `ORD-${year}-${sequence}`;
}
