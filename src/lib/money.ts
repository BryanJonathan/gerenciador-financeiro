const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const BRL_NUMBER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  return BRL.format(cents / 100);
}

export function formatCentsPlain(cents: number): string {
  return BRL_NUMBER.format(cents / 100);
}

export function parseBRLToCents(input: string): number | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  const cleaned = trimmed
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/[^\d,.-]/g, "");

  if (!cleaned) return null;

  const negative = cleaned.startsWith("-");
  const unsigned = cleaned.replace(/^-/, "");

  const hasComma = unsigned.includes(",");
  const hasDot = unsigned.includes(".");

  let normalized: string;
  if (hasComma && hasDot) {
    normalized = unsigned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = unsigned.replace(",", ".");
  } else {
    normalized = unsigned;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  const cents = Math.round(value * 100);
  return negative ? -cents : cents;
}
