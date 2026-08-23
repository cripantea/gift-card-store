const CARD_CODE_SIGNIFICANT_LENGTH = 16;
const CARD_CODE_GROUP_LENGTH = 4;

/**
 * Strips separators, uppercases, and re-groups into 4-character blocks
 * separated by dashes. Used both to live-format the cassa code input as the
 * operator types and to canonicalize a pasted/typed code before the DB
 * lookup, so both sides agree on a single format.
 */
export function formatCardCodeGroups(raw: string): string {
  const cleaned = raw
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, CARD_CODE_SIGNIFICANT_LENGTH);

  return cleaned.match(new RegExp(`.{1,${CARD_CODE_GROUP_LENGTH}}`, "g"))?.join("-") ?? cleaned;
}

export function isCompleteCardCode(formatted: string): boolean {
  return new RegExp(
    `^([A-Z0-9]{${CARD_CODE_GROUP_LENGTH}}-){3}[A-Z0-9]{${CARD_CODE_GROUP_LENGTH}}$`,
  ).test(formatted);
}
