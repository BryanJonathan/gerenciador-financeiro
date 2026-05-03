"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import type { Invite } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminInviteAction,
  revokeAdminInviteAction,
} from "./actions";

type EnrichedInvite = Invite & { usedByEmail: string | null };

function statusOf(invite: EnrichedInvite): {
  label: string;
  tone: "valid" | "used" | "expired";
} {
  if (invite.usedAt) return { label: "Usado", tone: "used" };
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return { label: "Expirado", tone: "expired" };
  }
  return { label: "Válido", tone: "valid" };
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AdminInvitesPanel({ invites }: { invites: EnrichedInvite[] }) {
  const [pending, start] = useTransition();
  const [lastCode, setLastCode] = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    start(async () => {
      const result = await createAdminInviteAction(formData);
      if (result.ok) {
        setLastCode(result.code);
        toast.success("Convite criado");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRevoke(code: string) {
    start(async () => {
      await revokeAdminInviteAction(code);
      toast.success("Convite revogado");
      if (lastCode === code) setLastCode(null);
    });
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code).then(
      () => toast.success("Código copiado"),
      () => toast.error("Não foi possível copiar"),
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Painel de convites
        </h1>
        <p className="text-sm text-muted-foreground">
          Gere códigos de convite para que novos usuários possam se cadastrar.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Novo convite</h2>
        <form action={handleCreate} className="space-y-3">
          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="restringe ao email informado"
            />
          </div>
          <div>
            <Label htmlFor="ttlDays">Validade (dias)</Label>
            <Input
              id="ttlDays"
              name="ttlDays"
              type="number"
              defaultValue={7}
              min={1}
              max={60}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Gerando…" : "Gerar código"}
          </Button>
        </form>

        {lastCode && (
          <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <p className="mb-2 font-medium text-emerald-700 dark:text-emerald-300">
              Código gerado — copie agora:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-background px-2 py-1 font-mono text-xs">
                {lastCode}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copy(lastCode)}
                aria-label="Copiar código"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">
          Convites ({invites.length})
        </h2>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((i) => {
              const status = statusOf(i);
              return (
                <li
                  key={i.code}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="break-all rounded bg-background px-2 py-0.5 font-mono text-xs">
                        {i.code}
                      </code>
                      <span
                        className={
                          status.tone === "valid"
                            ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300"
                            : status.tone === "used"
                              ? "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              : "rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                        }
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {i.email ? `Para ${i.email} · ` : ""}
                      Criado em {formatDate(i.createdAt)} · Expira em{" "}
                      {formatDate(i.expiresAt)}
                      {i.usedByEmail
                        ? ` · Usado por ${i.usedByEmail} em ${formatDate(i.usedAt!)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {status.tone === "valid" && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copy(i.code)}
                        aria-label="Copiar código"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    {!i.usedAt && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleRevoke(i.code)}
                        disabled={pending}
                        aria-label="Revogar convite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
