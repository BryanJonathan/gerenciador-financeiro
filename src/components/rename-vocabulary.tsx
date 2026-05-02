"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { titleCase } from "@/lib/format";
import {
  renameBankAction,
  renameCategoryAction,
} from "@/server/transactions/actions";

type Props = {
  kind: "bank" | "category";
  value: string;
};

export function RenameItem({ kind, value }: Props) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState(value);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const action = kind === "bank" ? renameBankAction : renameCategoryAction;
      const result = await action(value, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.data.updated} registro(s) atualizado(s)`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="icon" variant="ghost" aria-label="Renomear" />}
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Renomear {kind === "bank" ? "banco" : "categoria"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs text-muted-foreground">De</Label>
            <p className="font-medium">{titleCase(value)}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="rename-input" className="text-xs text-muted-foreground">
              Para
            </Label>
            <Input
              id="rename-input"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending || !next.trim() || next.trim().toLowerCase() === value}>
            {pending ? "Atualizando…" : "Atualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
