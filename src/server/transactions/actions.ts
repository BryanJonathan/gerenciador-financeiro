"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { transactionSchema } from "@/lib/validation";
import { requireUserId } from "@/server/auth/require-user";
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
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const row = await createTransaction(userId, parsed.data);
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function updateTransactionAction(
  id: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const row = await updateTransaction(userId, id, parsed.data);
  if (!row) {
    return { ok: false, error: "Transação não encontrada" };
  }
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await softDeleteTransaction(userId, id);
  revalidateAll();
  return { ok: true, data: undefined };
}

export async function restoreTransactionAction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await restoreTransaction(userId, id);
  revalidateAll();
  return { ok: true, data: undefined };
}

export async function renameBankAction(
  from: string,
  to: string,
): Promise<ActionResult<{ updated: number }>> {
  const userId = await requireUserId();
  const trimmedFrom = from.trim().toLowerCase();
  const trimmedTo = to.trim().toLowerCase();
  if (!trimmedFrom || !trimmedTo) {
    return { ok: false, error: "Nome inválido" };
  }
  const updated = await renameBank(userId, trimmedFrom, trimmedTo);
  revalidateAll();
  return { ok: true, data: { updated } };
}

export async function renameCategoryAction(
  from: string,
  to: string,
): Promise<ActionResult<{ updated: number }>> {
  const userId = await requireUserId();
  const trimmedFrom = from.trim().toLowerCase();
  const trimmedTo = to.trim().toLowerCase();
  if (!trimmedFrom || !trimmedTo) {
    return { ok: false, error: "Nome inválido" };
  }
  const updated = await renameCategory(userId, trimmedFrom, trimmedTo);
  revalidateAll();
  return { ok: true, data: { updated } };
}

export async function wipeAllAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  await hardDeleteAll(userId);
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
