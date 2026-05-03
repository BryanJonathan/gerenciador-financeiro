"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthActionResult } from "@/server/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(loginAction, null);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!fieldErrors?.email}
        />
        {fieldErrors?.email?.[0] && (
          <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!fieldErrors?.password}
        />
        {fieldErrors?.password?.[0] && (
          <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
        )}
      </div>
      {state && !state.ok && !fieldErrors && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
