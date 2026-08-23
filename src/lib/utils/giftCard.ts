import { randomBytes, randomInt } from "crypto";

// Excludes visually ambiguous characters (0, O, 1, I)
const CARD_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CARD_CODE_SEGMENT_LENGTH = 4;
const CARD_CODE_SEGMENT_COUNT = 4;

export function generateFormattedCardCode(): string {
  const segments = Array.from({ length: CARD_CODE_SEGMENT_COUNT }, () =>
    Array.from(
      { length: CARD_CODE_SEGMENT_LENGTH },
      () => CARD_CODE_CHARSET[randomInt(CARD_CODE_CHARSET.length)],
    ).join(""),
  );

  return segments.join("-");
}

export function generateSecretToken(): string {
  return randomBytes(16).toString("hex");
}
