"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { wipeAllAction } from "@/server/transactions/actions";

const CONFIRM = "APAGAR TUDO";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (confirm !== CONFIRM) return;
    startTransition(async () => {
      const result = await wipeAllAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Todas as transações foram removidas");
      setOpen(false);
      setConfirm("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" className="gap-2" />}>
        <TriangleAlert className="h-4 w-4" />
        Apagar todas as transações
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Essa ação remove permanentemente <strong>todas</strong> as transações cadastradas.
            Não tem como desfazer. Se quiser preservar histórico, exporte um CSV antes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-input">
            Digite <strong>{CONFIRM}</strong> para confirmar:
          </Label>
          <Input
            id="confirm-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            placeholder={CONFIRM}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={submit}
            disabled={pending || confirm !== CONFIRM}
          >
            {pending ? "Apagando…" : "Apagar tudo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
