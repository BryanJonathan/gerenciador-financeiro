import type { Transaction } from "@/server/db/schema";

export type Totals = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  count: number;
};

export type Bucket = {
  key: string;
  label: string;
  totalCents: number;
  count: number;
};

export function totals(rows: Transaction[]): Totals {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const r of rows) {
    if (r.type === "income") incomeCents += r.amountCents;
    else expenseCents += r.amountCents;
  }
  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
    count: rows.length,
  };
}

export function byCategory(rows: Transaction[]): Bucket[] {
  const buckets = new Map<string, Bucket>();
  for (const r of rows) {
    if (r.type !== "expense") continue;
    const key = r.category ?? "(sem categoria)";
    const existing = buckets.get(key);
    if (existing) {
      existing.totalCents += r.amountCents;
      existing.count += 1;
    } else {
      buckets.set(key, {
        key,
        label: key,
        totalCents: r.amountCents,
        count: 1,
      });
    }
  }
  return [...buckets.values()].sort((a, b) => b.totalCents - a.totalCents);
}

export function byBank(rows: Transaction[]): Bucket[] {
  const buckets = new Map<string, Bucket>();
  for (const r of rows) {
    const key = r.bank ?? "(sem banco)";
    const existing = buckets.get(key);
    if (existing) {
      existing.totalCents += r.amountCents;
      existing.count += 1;
    } else {
      buckets.set(key, {
        key,
        label: key,
        totalCents: r.amountCents,
        count: 1,
      });
    }
  }
  return [...buckets.values()].sort((a, b) => b.totalCents - a.totalCents);
}

export function dailyExpense(
  rows: Transaction[],
  monthStart: string,
  monthEnd: string,
): { day: string; totalCents: number }[] {
  const totalsMap = new Map<string, number>();
  for (const r of rows) {
    if (r.type !== "expense") continue;
    totalsMap.set(r.occurredOn, (totalsMap.get(r.occurredOn) ?? 0) + r.amountCents);
  }

  const result: { day: string; totalCents: number }[] = [];
  const [startY, startM, startD] = monthStart.split("-").map(Number);
  const [, , endD] = monthEnd.split("-").map(Number);
  for (let day = startD; day <= endD; day++) {
    const dayStr = `${startY}-${String(startM).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    result.push({ day: dayStr, totalCents: totalsMap.get(dayStr) ?? 0 });
  }
  return result;
}

export function monthlyTrend(
  rowsByMonth: { year: number; month: number; rows: Transaction[] }[],
): { year: number; month: number; incomeCents: number; expenseCents: number }[] {
  return rowsByMonth.map(({ year, month, rows }) => {
    const t = totals(rows);
    return {
      year,
      month,
      incomeCents: t.incomeCents,
      expenseCents: t.expenseCents,
    };
  });
}

export function topDescriptions(
  rows: Transaction[],
  limit = 10,
): { description: string; totalCents: number; count: number }[] {
  const map = new Map<string, { totalCents: number; count: number }>();
  for (const r of rows) {
    if (r.type !== "expense") continue;
    const key = r.description.toLowerCase().trim();
    const existing = map.get(key);
    if (existing) {
      existing.totalCents += r.amountCents;
      existing.count += 1;
    } else {
      map.set(key, { totalCents: r.amountCents, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([description, v]) => ({ description, ...v }))
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, limit);
}
