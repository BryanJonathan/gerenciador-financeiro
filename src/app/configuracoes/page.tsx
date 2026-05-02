import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RenameItem } from "@/components/rename-vocabulary";
import { DangerZone } from "@/components/danger-zone";
import { distinctBanks, distinctCategories } from "@/server/suggestions";
import { countTransactions } from "@/server/transactions/repository";
import { titleCase } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [banks, categories, count] = await Promise.all([
    distinctBanks(),
    distinctCategories(),
    countTransactions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          {count} transação(ões) ativa(s)
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium">Exportar</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Baixa um CSV com todas as transações ativas. Importável no Excel/Google Sheets.
        </p>
        <a
          href="/api/export"
          download
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <Download className="h-4 w-4" />
          Baixar CSV
        </a>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium">Categorias</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Renomear aqui atualiza todas as transações que usam essa categoria.
        </p>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c} className="flex items-center justify-between py-2">
                <span>{titleCase(c)}</span>
                <RenameItem kind="category" value={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium">Bancos</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Renomear aqui atualiza todas as transações que usam esse banco.
        </p>
        {banks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum banco cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {banks.map((b) => (
              <li key={b} className="flex items-center justify-between py-2">
                <span>{titleCase(b)}</span>
                <RenameItem kind="bank" value={b} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <h2 className="mb-2 text-sm font-medium text-destructive">Zona perigosa</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Limpar todos os dados. Útil para começar do zero. Faça um export antes!
        </p>
        <DangerZone />
      </section>
    </div>
  );
}
