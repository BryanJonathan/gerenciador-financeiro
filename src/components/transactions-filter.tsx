"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { titleCase } from "@/lib/format";
import { lastNMonths, monthLabel } from "@/lib/dates";

type Props = {
  banks: string[];
  categories: string[];
};

const ANY = "__any__";

export function TransactionsFilter({ banks, categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const month = params.get("month") ?? "";
  const type = params.get("type") ?? "";
  const category = params.get("category") ?? "";
  const bank = params.get("bank") ?? "";
  const search = params.get("q") ?? "";

  function update(next: Record<string, string>) {
    const url = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) url.set(k, v);
      else url.delete(k);
    }
    startTransition(() => router.push(`/transacoes?${url.toString()}`));
  }

  function reset() {
    startTransition(() => router.push("/transacoes"));
  }

  const months = lastNMonths(12);
  const hasFilters = !!(month || type || category || bank || search);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6">
      <div className="relative col-span-1 md:col-span-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar descrição…"
          defaultValue={search}
          className="pl-8"
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>

      <Select
        value={month || ANY}
        onValueChange={(v) => update({ month: v === ANY || !v ? "" : String(v) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Todos os meses</SelectItem>
          {months.map((m) => {
            const value = `${m.year}-${String(m.month).padStart(2, "0")}`;
            return (
              <SelectItem key={value} value={value}>
                {monthLabel(m.year, m.month)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select
        value={type || ANY}
        onValueChange={(v) => update({ type: v === ANY || !v ? "" : String(v) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Todos os tipos</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
          <SelectItem value="income">Entradas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={category || ANY}
        onValueChange={(v) => update({ category: v === ANY || !v ? "" : String(v) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Todas as categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {titleCase(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={bank || ANY}
        onValueChange={(v) => update({ bank: v === ANY || !v ? "" : String(v) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Banco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Todos os bancos</SelectItem>
          {banks.map((b) => (
            <SelectItem key={b} value={b}>
              {titleCase(b)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="outline"
          onClick={reset}
          disabled={pending}
          className="gap-2 sm:col-span-2 md:col-span-1"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
