/**
 * Cella CSV sicura da aprire in Excel: tra virgolette, con le virgolette
 * raddoppiate, e con un apostrofo davanti ai testi che inizierebbero una
 * formula (=, +, -, @): nome e note li scrivono i clienti (CSV injection).
 */
export function csvCell(value: string | number | null | undefined): string {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
