"use server";

import { revalidatePath } from "next/cache";
import { requireBasicAuth } from "@/server/auth/require-basic";
import {
  createInvite,
  revokeInvite,
} from "@/server/invites/repository";

export type AdminInviteResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function createAdminInviteAction(
  formData: FormData,
): Promise<AdminInviteResult> {
  await requireBasicAuth();

  const email = (formData.get("email") as string | null) ?? null;
  const ttlRaw = (formData.get("ttlDays") as string | null) ?? "7";
  const ttlDays = Math.min(Math.max(Number.parseInt(ttlRaw, 10) || 7, 1), 60);

  const invite = await createInvite("admin", email, ttlDays);
  revalidatePath("/admin/invites");
  return { ok: true, code: invite.code };
}

export async function revokeAdminInviteAction(
  code: string,
): Promise<{ ok: boolean }> {
  await requireBasicAuth();
  await revokeInvite(code);
  revalidatePath("/admin/invites");
  return { ok: true };
}
