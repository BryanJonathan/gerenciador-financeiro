"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { consumeInvite, findValidInvite } from "@/server/invites/repository";
import { credentialsSchema, signupSchema } from "@/lib/validation";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flattenFieldErrors(
  err: unknown,
): Record<string, string[]> | undefined {
  if (
    err &&
    typeof err === "object" &&
    "flatten" in err &&
    typeof (err as { flatten: unknown }).flatten === "function"
  ) {
    return (err as { flatten: () => { fieldErrors: Record<string, string[]> } })
      .flatten().fieldErrors;
  }
  return undefined;
}

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        error:
          err.type === "CredentialsSignin"
            ? "Email ou senha incorretos"
            : "Não foi possível entrar",
      };
    }
    throw err;
  }
}

export async function signupAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
    inviteCode: formData.get("inviteCode"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }
  const { email, password, name, inviteCode } = parsed.data;

  const invite = await findValidInvite(inviteCode, email);
  if (!invite) {
    return {
      ok: false,
      error: "Convite inválido, expirado ou para outro email",
    };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { ok: false, error: "Já existe uma conta com esse email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [created] = await db
    .insert(users)
    .values({ email, passwordHash, name: name ?? null })
    .returning({ id: users.id });

  const consumed = await consumeInvite(inviteCode, created.id);
  if (!consumed) {
    await db.delete(users).where(eq(users.id, created.id));
    return { ok: false, error: "Convite já utilizado" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        error: "Conta criada — entre manualmente em /login",
      };
    }
    throw err;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
