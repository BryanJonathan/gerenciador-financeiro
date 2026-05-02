import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionsFilter } from "@/components/transactions-filter";
import { listTransactions } from "@/server/transactions/repository";
import { distinctBanks, distinctCategories } from "@/server/suggestions";
import { totals } from "@/server/reports";
import { formatCents } from "@/lib/money";
import { monthRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Search = Promise<{
  month?: string;
  type?: string;
  category?: string;
  bank?: string;
  q?: string;
}>;

export default async function TransactionsPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;

  let from: string | undefined;
  let to: string | undefined;
  if (sp.month) {
    const [y, m] = sp.month.split("-").map(Number);
    if (y && m) {
      const range = monthRange(y, m);
      from = range.from;
      to = range.to;
    }
  }

  const [rows, banks, categories] = await Promise.all([
    listTransactions({
      from,
      to,
      type: sp.type === "income" || sp.type === "expense" ? sp.type : undefined,
      category: sp.category,
      bank: sp.bank,
      search: sp.q,
    }),
    distinctBanks(),
    distinctCategories(),
  ]);

  const t = totals(rows);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">
            {t.count} {t.count === 1 ? "registro" : "registros"} · entradas{" "}
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {formatCents(t.incomeCents)}
            </span>{" "}
            · despesas{" "}
            <span className="font-medium text-rose-700 dark:text-rose-300">
              {formatCents(t.expenseCents)}
            </span>
          </p>
        </div>
        <Link href="/transacoes/nova" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" />
          Nova
        </Link>
      </div>

      <TransactionsFilter banks={banks} categories={categories} />

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <TransactionRow key={row.id} transaction={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <h2 className="text-lg font-medium">Nenhuma transação encontrada</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajuste os filtros ou cadastre uma nova transação.
      </p>
      <Link
        href="/transacoes/nova"
        className={cn(buttonVariants(), "mt-4 gap-2")}
      >
        <Plus className="h-4 w-4" />
        Adicionar
      </Link>
    </div>
  );
}
