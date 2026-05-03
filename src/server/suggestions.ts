import { isNotNull, isNull, sql, and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";

export async function distinctCategories(userId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ value: transactions.category })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        isNotNull(transactions.category),
      ),
    )
    .orderBy(transactions.category);
  return rows.map((r) => r.value!).filter(Boolean);
}

export async function distinctBanks(userId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ value: transactions.bank })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        isNotNull(transactions.bank),
      ),
    )
    .orderBy(transactions.bank);
  return rows.map((r) => r.value!).filter(Boolean);
}

export async function mostUsedBankThisPeriod(
  userId: string,
  from: string,
  to: string,
): Promise<string | null> {
  const rows = await db
    .select({
      bank: transactions.bank,
      n: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        isNotNull(transactions.bank),
        sql`${transactions.occurredOn} >= ${from}`,
        sql`${transactions.occurredOn} <= ${to}`,
      ),
    )
    .groupBy(transactions.bank)
    .orderBy(sql`count(*) desc`)
    .limit(1);
  return rows[0]?.bank ?? null;
}

export async function categoryForDescription(
  userId: string,
  description: string,
): Promise<string | null> {
  const trimmed = description.trim().toLowerCase();
  if (!trimmed) return null;
  const rows = await db
    .select({ category: transactions.category })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        isNotNull(transactions.category),
        eq(sql`lower(${transactions.description})`, trimmed),
      ),
    )
    .orderBy(sql`${transactions.createdAt} desc`)
    .limit(1);
  return rows[0]?.category ?? null;
}
