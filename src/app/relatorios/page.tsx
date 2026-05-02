import { CategoryDonut } from "@/components/charts/category-donut";
import { TrendLine } from "@/components/charts/trend-line";
import { KpiCard } from "@/components/kpi-card";
import { MonthPicker } from "@/components/month-picker";
import { listTransactions } from "@/server/transactions/repository";
import {
  byBank,
  byCategory,
  monthlyTrend,
  topDescriptions,
  totals,
} from "@/server/reports";
import {
  currentYearMonth,
  endOfYear,
  lastNMonths,
  monthLabel,
  monthRange,
  startOfYear,
} from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { capitalize, titleCase } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = Promise<{ month?: string }>;

export default async function ReportsPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const current = currentYearMonth();
  let year = current.year;
  let month = current.month;
  if (sp.month) {
    const [y, m] = sp.month.split("-").map(Number);
    if (y && m) {
      year = y;
      month = m;
    }
  }
  const { from, to } = monthRange(year, month);

  const trendMonths = lastNMonths(6);
  const trendStart = `${trendMonths[0].year}-${String(trendMonths[0].month).padStart(2, "0")}-01`;
  const trendLast = trendMonths[trendMonths.length - 1];
  const trendEnd = monthRange(trendLast.year, trendLast.month).to;

  const [monthRows, trendRows, ytdRows] = await Promise.all([
    listTransactions({ from, to }),
    listTransactions({ from: trendStart, to: trendEnd }),
    listTransactions({ from: startOfYear(year), to: endOfYear(year) }),
  ]);

  const t = totals(monthRows);
  const categoriesData = byCategory(monthRows);
  const banksData = byBank(monthRows.filter((r) => r.type === "expense"));
  const top = topDescriptions(monthRows, 10);

  const trendByMonth = trendMonths.map((m) => ({
    year: m.year,
    month: m.month,
    rows: trendRows.filter((r) => {
      const [ry, rm] = r.occurredOn.split("-").map(Number);
      return ry === m.year && rm === m.month;
    }),
  }));
  const trend = monthlyTrend(trendByMonth);

  const ytd = totals(ytdRows);
  const totalExpenseMonth = t.expenseCents || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            {capitalize(monthLabel(year, month))}
          </p>
        </div>
        <MonthPicker />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Entradas" value={formatCents(t.incomeCents)} tone="income" />
        <KpiCard label="Despesas" value={formatCents(t.expenseCents)} tone="expense" />
        <KpiCard
          label="Saldo"
          value={formatCents(t.balanceCents)}
          tone={t.balanceCents >= 0 ? "income" : "expense"}
        />
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Tendência (últimos 6 meses)</h2>
        <TrendLine data={trend} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Por categoria</h2>
          <CategoryDonut data={categoriesData} />
          {categoriesData.length > 0 && (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {categoriesData.map((c) => {
                  const pct = ((c.totalCents / totalExpenseMonth) * 100).toFixed(1);
                  return (
                    <tr key={c.key} className="border-t border-border">
                      <td className="py-2 capitalize">{c.label}</td>
                      <td className="py-2 text-right tabular-nums">{formatCents(c.totalCents)}</td>
                      <td className="py-2 text-right text-muted-foreground tabular-nums w-16">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Despesas por banco</h2>
          {banksData.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sem dados por banco neste período.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {banksData.map((b) => (
                  <tr key={b.key} className="border-t border-border">
                    <td className="py-2 capitalize">{b.label}</td>
                    <td className="py-2 text-right tabular-nums">{formatCents(b.totalCents)}</td>
                    <td className="py-2 text-right text-muted-foreground w-16">
                      {b.count}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Top descrições do mês</h2>
        {top.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem despesas neste período.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 text-left font-medium">Descrição</th>
                <th className="py-2 text-right font-medium">Total</th>
                <th className="py-2 text-right font-medium w-16">Vezes</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => (
                <tr key={row.description} className="border-t border-border">
                  <td className="py-2">{titleCase(row.description)}</td>
                  <td className="py-2 text-right tabular-nums">{formatCents(row.totalCents)}</td>
                  <td className="py-2 text-right text-muted-foreground">{row.count}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium">No ano de {year}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard label="Entradas YTD" value={formatCents(ytd.incomeCents)} tone="income" />
          <KpiCard label="Despesas YTD" value={formatCents(ytd.expenseCents)} tone="expense" />
          <KpiCard
            label="Saldo YTD"
            value={formatCents(ytd.balanceCents)}
            tone={ytd.balanceCents >= 0 ? "income" : "expense"}
          />
        </div>
      </section>
    </div>
  );
}
