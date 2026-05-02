const TZ = "America/Sao_Paulo";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  month: "long",
  year: "numeric",
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  month: "short",
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
});

export function todayInBRT(): string {
  const parts = DATE_FORMATTER.formatToParts(new Date());
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  return `${year}-${month}-${day}`;
}

export function isoDate(date: Date): string {
  const parts = DATE_FORMATTER.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  return `${year}-${month}-${day}`;
}

export function formatDateBR(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function formatWeekdayBR(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12));
  return WEEKDAY_FORMATTER.format(d);
}

export function parseBRDate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  if (Number(month) < 1 || Number(month) > 12) return null;
  if (Number(day) < 1 || Number(day) > 31) return null;
  return `${year}-${month}-${day}`;
}

export function monthRange(year: number, month: number): { from: string; to: string } {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDayDate = new Date(Date.UTC(year, month, 0));
  const lastDay = lastDayDate.getUTCDate();
  const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from: firstDay, to: lastDayStr };
}

export function currentYearMonth(): { year: number; month: number } {
  const today = todayInBRT();
  const [y, m] = today.split("-").map(Number);
  return { year: y, month: m };
}

export function monthLabel(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month - 1, 15));
  return MONTH_LABEL_FORMATTER.format(d);
}

export function shortMonthLabel(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month - 1, 15));
  return SHORT_MONTH_FORMATTER.format(d);
}

export function lastNMonths(n: number): { year: number; month: number }[] {
  const { year, month } = currentYearMonth();
  const out: { year: number; month: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    out.push({ year: y, month: m });
  }
  return out;
}

export function startOfYear(year: number): string {
  return `${year}-01-01`;
}

export function endOfYear(year: number): string {
  return `${year}-12-31`;
}
