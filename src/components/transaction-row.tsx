"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";
import { formatDateBR } from "@/lib/dates";
import { titleCase } from "@/lib/format";
import {
  deleteTransactionAction,
  restoreTransactionAction,
} from "@/server/transactions/actions";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/server/db/schema";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [pending, startTransition] = useTransition();
  const isExpense = transaction.type === "expense";
  const sign = isExpense ? "-" : "+";

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTransactionAction(transaction.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Transação removida", {
        action: {
          label: "Desfazer",
          onClick: async () => {
            const restore = await restoreTransactionAction(transaction.id);
            if (!restore.ok) toast.error(restore.error);
            else toast.success("Restaurada");
          },
        },
        duration: 5000,
      });
    });
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors",
        pending && "opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isExpense
            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        )}
        aria-hidden
      >
        {isExpense ? (
          <ArrowDownRight className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-medium">{titleCase(transaction.description)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>{formatDateBR(transaction.occurredOn)}</span>
          {transaction.category && (
            <>
              <span>·</span>
              <Badge variant="secondary" className="font-normal">
                {titleCase(transaction.category)}
              </Badge>
            </>
          )}
          {transaction.bank && (
            <>
              <span>·</span>
              <span>{titleCase(transaction.bank)}</span>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 text-right tabular-nums font-semibold",
          isExpense ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300",
        )}
      >
        {sign} {formatCents(transaction.amountCents)}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/transacoes/${transaction.id}`}
          aria-label="Editar"
          className={buttonVariants({ size: "icon", variant: "ghost" })}
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Excluir"
          onClick={handleDelete}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
