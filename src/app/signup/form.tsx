"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type AuthActionResult } from "@/server/auth/actions";

export function SignupForm({ defaultInviteCode }: { defaultInviteCode: string }) {
  const [state, action, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signupAction, null);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="inviteCode">Código de convite</Label>
        <Input
          id="inviteCode"
          name="inviteCode"
          required
          defaultValue={defaultInviteCode}
          aria-invalid={!!fieldErrors?.inviteCode}
        />
        {fieldErrors?.inviteCode?.[0] && (
          <p className="text-xs text-destructive">
            {fieldErrors.inviteCode[0]}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome (opcional)</Label>
        <Input id="name" name="name" autoComplete="name" />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
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
        {pending ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
}
