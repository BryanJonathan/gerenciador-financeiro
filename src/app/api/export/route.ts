import { NextResponse } from "next/server";
import { listTransactions } from "@/server/transactions/repository";
import { formatCentsPlain } from "@/lib/money";
import { formatDateBR } from "@/lib/dates";

export const dynamic = "force-dynamic";

function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  const needsQuoting = /[",\n;]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

export async function GET() {
  const rows = await listTransactions({ orderBy: "occurred_on_desc" });

  const header = ["Data", "Tipo", "Descrição", "Valor (R$)", "Banco", "Categoria", "Notas"];
  const lines = [header.join(";")];
  for (const r of rows) {
    lines.push(
      [
        formatDateBR(r.occurredOn),
        r.type === "income" ? "Entrada" : "Despesa",
        csvEscape(r.description),
        formatCentsPlain(r.amountCents),
        csvEscape(r.bank),
        csvEscape(r.category),
        csvEscape(r.notes),
      ].join(";"),
    );
  }
  const csv = "﻿" + lines.join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transacoes-${today}.csv"`,
    },
  });
}
