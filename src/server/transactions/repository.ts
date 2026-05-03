import { and, asc, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { transactions, type Transaction, type TransactionType } from "@/server/db/schema";
import type { TransactionInput } from "@/lib/validation";

export type TransactionFilter = {
  from?: string;
  to?: string;
  type?: TransactionType;
  category?: string;
  bank?: string;
  search?: string;
  includeDeleted?: boolean;
  orderBy?: "occurred_on_desc" | "occurred_on_asc" | "created_at_desc";
  limit?: number;
};

function buildWhere(userId: string, filter: TransactionFilter) {
  const conditions = [eq(transactions.userId, userId)];
  if (!filter.includeDeleted) {
    conditions.push(isNull(transactions.deletedAt));
  }
  if (filter.from) conditions.push(gte(transactions.occurredOn, filter.from));
  if (filter.to) conditions.push(lte(transactions.occurredOn, filter.to));
  if (filter.type) conditions.push(eq(transactions.type, filter.type));
  if (filter.category) conditions.push(eq(transactions.category, filter.category.toLowerCase()));
  if (filter.bank) conditions.push(eq(transactions.bank, filter.bank.toLowerCase()));
  if (filter.search) {
    const term = `%${filter.search}%`;
    conditions.push(
      or(
        ilike(transactions.description, term),
        ilike(transactions.notes, term),
      )!,
    );
  }
  return and(...conditions);
}

export async function listTransactions(
  userId: string,
  filter: TransactionFilter = {},
): Promise<Transaction[]> {
  const orderBy =
    filter.orderBy === "occurred_on_asc"
      ? [asc(transactions.occurredOn), asc(transactions.createdAt)]
      : filter.orderBy === "created_at_desc"
        ? [desc(transactions.createdAt)]
        : [desc(transactions.occurredOn), desc(transactions.createdAt)];

  const where = buildWhere(userId, filter);

  const baseQuery = db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(...orderBy);

  if (filter.limit) {
    return baseQuery.limit(filter.limit);
  }

  return baseQuery;
}

export async function findTransactionById(
  userId: string,
  id: string,
): Promise<Transaction | null> {
  const result = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
): Promise<Transaction> {
  const [row] = await db
    .insert(transactions)
    .values({
      userId,
      type: input.type,
      description: input.description,
      amountCents: input.amountCents,
      occurredOn: input.occurredOn,
      bank: input.bank,
      category: input.category,
      notes: input.notes,
    })
    .returning();
  return row;
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionInput,
): Promise<Transaction | null> {
  const [row] = await db
    .update(transactions)
    .set({
      type: input.type,
      description: input.description,
      amountCents: input.amountCents,
      occurredOn: input.occurredOn,
      bank: input.bank,
      category: input.category,
      notes: input.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return row ?? null;
}

export async function softDeleteTransaction(
  userId: string,
  id: string,
): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function restoreTransaction(
  userId: string,
  id: string,
): Promise<void> {
  await db
    .update(transactions)
    .set({ deletedAt: null })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function hardDeleteAll(userId: string): Promise<void> {
  await db.delete(transactions).where(eq(transactions.userId, userId));
}

export async function renameBank(
  userId: string,
  from: string,
  to: string,
): Promise<number> {
  const result = await db
    .update(transactions)
    .set({ bank: to.toLowerCase(), updatedAt: new Date() })
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.bank, from.toLowerCase()),
      ),
    );
  return result.rowCount ?? 0;
}

export async function renameCategory(
  userId: string,
  from: string,
  to: string,
): Promise<number> {
  const result = await db
    .update(transactions)
    .set({ category: to.toLowerCase(), updatedAt: new Date() })
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.category, from.toLowerCase()),
      ),
    );
  return result.rowCount ?? 0;
}

export async function countTransactions(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), isNull(transactions.deletedAt)),
    );
  return result[0]?.count ?? 0;
}
