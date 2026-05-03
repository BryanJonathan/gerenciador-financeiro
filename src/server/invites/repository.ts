import { randomBytes } from "node:crypto";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { invites, type Invite } from "@/server/db/schema";

export type InviteScope = { admin: true } | { userId: string };

export async function createInvite(
  createdBy: string,
  email: string | null,
  ttlDays: number,
): Promise<Invite> {
  const code = randomBytes(16).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const normalizedEmail = email?.trim().toLowerCase() || null;

  const [row] = await db
    .insert(invites)
    .values({
      code,
      email: normalizedEmail,
      createdBy,
      expiresAt,
    })
    .returning();
  return row;
}

export async function listInvites(scope: InviteScope): Promise<Invite[]> {
  const where =
    "admin" in scope
      ? undefined
      : eq(invites.createdBy, scope.userId);
  const query = db.select().from(invites).orderBy(desc(invites.createdAt));
  return where ? query.where(where) : query;
}

export async function findValidInvite(
  code: string,
  email: string,
): Promise<Invite | null> {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.code, code),
        isNull(invites.usedAt),
        sql`${invites.expiresAt} > now()`,
      ),
    )
    .limit(1);
  if (!row) return null;
  if (row.email && row.email !== normalized) return null;
  return row;
}

export async function consumeInvite(
  code: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .update(invites)
    .set({ usedBy: userId, usedAt: new Date() })
    .where(
      and(
        eq(invites.code, code),
        isNull(invites.usedAt),
        sql`${invites.expiresAt} > now()`,
      ),
    );
  return (result.rowCount ?? 0) > 0;
}

export async function revokeInvite(code: string): Promise<void> {
  await db.delete(invites).where(eq(invites.code, code));
}
