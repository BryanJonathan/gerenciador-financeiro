import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionForm } from "@/components/transaction-form";
import { distinctBanks, distinctCategories, mostUsedBankThisPeriod } from "@/server/suggestions";
import { requireUserId } from "@/server/auth/require-user";
import { currentYearMonth, monthRange } from "@/lib/dates";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const userId = await requireUserId();
  const { year, month } = currentYearMonth();
  const { from, to } = monthRange(year, month);
  const [banks, categories, defaultBank] = await Promise.all([
    distinctBanks(userId),
    distinctCategories(userId),
    mostUsedBankThisPeriod(userId, from, to),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/transacoes"
          aria-label="Voltar"
          className={buttonVariants({ size: "icon", variant: "ghost" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nova transação</h1>
      </div>

      <TransactionForm
        mode="create"
        banks={banks}
        categories={categories}
        defaultBank={defaultBank}
        redirectTo="/"
      />
    </div>
  );
}
