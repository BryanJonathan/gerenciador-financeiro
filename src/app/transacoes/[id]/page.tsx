import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TransactionForm } from "@/components/transaction-form";
import { distinctBanks, distinctCategories } from "@/server/suggestions";
import { findTransactionById } from "@/server/transactions/repository";
import { requireUserId } from "@/server/auth/require-user";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTransactionPage({ params }: Props) {
  const [userId, { id }] = await Promise.all([requireUserId(), params]);
  const [transaction, banks, categories] = await Promise.all([
    findTransactionById(userId, id),
    distinctBanks(userId),
    distinctCategories(userId),
  ]);

  if (!transaction || transaction.deletedAt) {
    notFound();
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">Editar transação</h1>
      </div>

      <TransactionForm
        mode="edit"
        transactionId={transaction.id}
        banks={banks}
        categories={categories}
        defaults={{
          type: transaction.type as "income" | "expense",
          description: transaction.description,
          amountCents: transaction.amountCents,
          occurredOn: transaction.occurredOn,
          bank: transaction.bank ?? "",
          category: transaction.category ?? "",
          notes: transaction.notes ?? "",
        }}
        redirectTo="/transacoes"
      />
    </div>
  );
}
