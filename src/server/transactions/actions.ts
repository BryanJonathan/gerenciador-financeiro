"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { transactionSchema } from "@/lib/validation";
import {
  createTransaction,
  hardDeleteAll,
  renameBank,
  renameCategory,
  restoreTransaction,
  softDeleteTransaction,
  updateTransaction,
} from "@/server/transactions/repository";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createTransactionAction(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const row = await createTransaction(parsed.data);
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function updateTransactionAction(
  id: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const row = await updateTransaction(id, parsed.data);
  if (!row) {
    return { ok: false, error: "Transação não encontrada" };
  }
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  await softDeleteTransaction(id);
  revalidateAll();
  return { ok: true, data: undefined };
}

export async function restoreTransactionAction(id: string): Promise<ActionResult> {
  await restoreTransaction(id);
  revalidateAll();
  return { ok: true, data: undefined };
}

export async function renameBankAction(
  from: string,
  to: string,
): Promise<ActionResult<{ updated: number }>> {
  const trimmedFrom = from.trim().toLowerCase();
  const trimmedTo = to.trim().toLowerCase();
  if (!trimmedFrom || !trimmedTo) {
    return { ok: false, error: "Nome inválido" };
  }
  const updated = await renameBank(trimmedFrom, trimmedTo);
  revalidateAll();
  return { ok: true, data: { updated } };
}

export async function renameCategoryAction(
  from: string,
  to: string,
): Promise<ActionResult<{ updated: number }>> {
  const trimmedFrom = from.trim().toLowerCase();
  const trimmedTo = to.trim().toLowerCase();
  if (!trimmedFrom || !trimmedTo) {
    return { ok: false, error: "Nome inválido" };
  }
  const updated = await renameCategory(trimmedFrom, trimmedTo);
  revalidateAll();
  return { ok: true, data: { updated } };
}

export async function wipeAllAction(): Promise<ActionResult> {
  await hardDeleteAll();
  revalidateAll();
  return { ok: true, data: undefined };
}

export async function createTransactionAndRedirectAction(
  raw: unknown,
  redirectTo: string,
): Promise<void> {
  const result = await createTransactionAction(raw);
  if (result.ok) redirect(redirectTo);
}
