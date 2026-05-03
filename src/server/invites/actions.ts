"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { invites } from "@/server/db/schema";
import { requireUserId } from "@/server/auth/require-user";
import { createInvite } from "@/server/invites/repository";

export type InviteResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function createUserInviteAction(
  formData: FormData,
): Promise<InviteResult> {
  const userId = await requireUserId();
  const email = (formData.get("email") as string | null) ?? null;
  const ttlRaw = (formData.get("ttlDays") as string | null) ?? "7";
  const ttlDays = Math.min(Math.max(Number.parseInt(ttlRaw, 10) || 7, 1), 60);

  const invite = await createInvite(userId, email, ttlDays);
  revalidatePath("/configuracoes");
  return { ok: true, code: invite.code };
}

export async function revokeUserInviteAction(
  code: string,
): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  await db
    .delete(invites)
    .where(and(eq(invites.code, code), eq(invites.createdBy, userId)));
  revalidatePath("/configuracoes");
  return { ok: true };
}
