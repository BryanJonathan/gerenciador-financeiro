import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/kpi-card";
import { TransactionRow } from "@/components/transaction-row";
import { CategoryDonut } from "@/components/charts/category-donut";
import { DailyBar } from "@/components/charts/daily-bar";
import { listTransactions } from "@/server/transactions/repository";
import { requireUserId } from "@/server/auth/require-user";
import { byCategory, dailyExpense, totals } from "@/server/reports";
import { currentYearMonth, monthLabel, monthRange } from "@/lib/dates";
import { capitalize } from "@/lib/format";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const { year, month } = currentYearMonth();
  const { from, to } = monthRange(year, month);

  const [monthRows, recent] = await Promise.all([
    listTransactions(userId, { from, to, orderBy: "occurred_on_desc" }),
    listTransactions(userId, { orderBy: "created_at_desc", limit: 5 }),
  ]);

  const t = totals(monthRows);
  const categoriesData = byCategory(monthRows);
  const dailyData = dailyExpense(monthRows, from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {capitalize(monthLabel(year, month))}
          </h1>
          <p className="text-sm text-muted-foreground">Resumo do mês corrente</p>
        </div>
        <Link href="/transacoes/nova" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" />
          Nova transação
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Entradas"
          value={formatCents(t.incomeCents)}
          hint={`${monthRows.filter((r) => r.type === "income").length} registro(s)`}
          tone="income"
        />
        <KpiCard
          label="Despesas"
          value={formatCents(t.expenseCents)}
          hint={`${monthRows.filter((r) => r.type === "expense").length} registro(s)`}
          tone="expense"
        />
        <KpiCard
          label="Saldo"
          value={formatCents(t.balanceCents)}
          hint={t.balanceCents >= 0 ? "Sobrando" : "No vermelho"}
          tone={t.balanceCents >= 0 ? "income" : "expense"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Despesas por categoria</h2>
          <CategoryDonut data={categoriesData} />
          {categoriesData.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {categoriesData.slice(0, 5).map((c) => (
                <li key={c.key} className="flex justify-between text-muted-foreground">
                  <span className="capitalize">{c.label}</span>
                  <span className="tabular-nums text-foreground">
                    {formatCents(c.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Despesas por dia</h2>
          <DailyBar data={dailyData} />
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Lançamentos recentes</h2>
          <Link
            href="/transacoes"
            className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
          >
            Ver todos
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum lançamento ainda. Adicione o primeiro pelo botão acima.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((row) => (
              <TransactionRow key={row.id} transaction={row} />
            ))}
          </div>
        )}
      </section>

      <Link
        href="/transacoes/nova"
        aria-label="Adicionar transação"
        className={cn(
          buttonVariants(),
          "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full p-0 shadow-lg md:hidden",
        )}
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
