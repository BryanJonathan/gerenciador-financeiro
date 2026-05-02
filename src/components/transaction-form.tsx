"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MoneyInput } from "@/components/money-input";
import { ComboboxHistory } from "@/components/combobox-history";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/server/transactions/actions";
import { todayInBRT } from "@/lib/dates";
import { cn } from "@/lib/utils";

type FormValues = {
  type: "income" | "expense";
  description: string;
  amountCents: number | null;
  occurredOn: string;
  bank: string;
  category: string;
  notes: string;
};

type Props = {
  mode: "create" | "edit";
  transactionId?: string;
  defaults?: Partial<FormValues>;
  banks: string[];
  categories: string[];
  defaultBank?: string | null;
  redirectTo?: string;
};

const EMPTY: FormValues = {
  type: "expense",
  description: "",
  amountCents: null,
  occurredOn: "",
  bank: "",
  category: "",
  notes: "",
};

export function TransactionForm({
  mode,
  transactionId,
  defaults,
  banks,
  categories,
  defaultBank,
  redirectTo = "/transacoes",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initial: FormValues = {
    ...EMPTY,
    occurredOn: todayInBRT(),
    bank: defaultBank ?? "",
    ...defaults,
  };

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
    watch,
  } = useForm<FormValues>({ defaultValues: initial });

  const type = watch("type");

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);

    if (!values.description.trim()) {
      setError("description", { message: "Descrição obrigatória" });
      return;
    }
    if (values.amountCents == null || values.amountCents <= 0) {
      setError("amountCents", { message: "Valor deve ser maior que zero" });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.occurredOn)) {
      setError("occurredOn", { message: "Data inválida" });
      return;
    }

    const payload = {
      type: values.type,
      description: values.description.trim(),
      amountCents: values.amountCents,
      occurredOn: values.occurredOn,
      bank: values.bank?.trim() || undefined,
      category: values.category?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    startTransition(async () => {
      const action =
        mode === "create"
          ? createTransactionAction(payload)
          : updateTransactionAction(transactionId!, payload);
      const result = await action;
      if (!result.ok) {
        setSubmitError(result.error);
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [field, msgs] of Object.entries(result.fieldErrors)) {
            if (msgs?.[0]) {
              setError(field as keyof FormValues, { message: msgs[0] });
            }
          }
        }
        return;
      }
      toast.success(mode === "create" ? "Transação adicionada" : "Transação atualizada");
      router.push(redirectTo);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <ToggleGroup
            multiple={false}
            value={field.value ? [field.value] : []}
            onValueChange={(v) => {
              const next = v[0];
              if (next === "income" || next === "expense") field.onChange(next);
            }}
            className="grid w-full grid-cols-2 gap-2"
          >
            <ToggleGroupItem
              value="expense"
              aria-label="Despesa"
              className={cn(
                "h-12 flex-1 gap-2 rounded-md border border-input data-[state=on]:border-rose-400 data-[state=on]:bg-rose-50 data-[state=on]:text-rose-700 dark:data-[state=on]:bg-rose-950/40 dark:data-[state=on]:text-rose-300",
              )}
            >
              <ArrowDownRight className="h-4 w-4" />
              Despesa
            </ToggleGroupItem>
            <ToggleGroupItem
              value="income"
              aria-label="Entrada"
              className={cn(
                "h-12 flex-1 gap-2 rounded-md border border-input data-[state=on]:border-emerald-400 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 dark:data-[state=on]:bg-emerald-950/40 dark:data-[state=on]:text-emerald-300",
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Entrada
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Controller
          control={control}
          name="amountCents"
          render={({ field }) => (
            <MoneyInput
              id="amount"
              autoFocus
              valueCents={field.value}
              onChangeCents={field.onChange}
              ariaInvalid={!!errors.amountCents}
            />
          )}
        />
        {errors.amountCents && (
          <p className="text-xs text-destructive">{errors.amountCents.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder={type === "income" ? "Ex: salário" : "Ex: sorvete"}
          autoComplete="off"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="occurredOn">Data</Label>
        <Input
          id="occurredOn"
          type="date"
          aria-invalid={!!errors.occurredOn}
          {...register("occurredOn")}
        />
        {errors.occurredOn && (
          <p className="text-xs text-destructive">{errors.occurredOn.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Banco (opcional)</Label>
          <Controller
            control={control}
            name="bank"
            render={({ field }) => (
              <ComboboxHistory
                options={banks}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecionar banco…"
                triggerLabel="Banco"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria (opcional)</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <ComboboxHistory
                options={categories}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecionar categoria…"
                triggerLabel="Categoria"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>

      {submitError && (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : mode === "create" ? "Adicionar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
