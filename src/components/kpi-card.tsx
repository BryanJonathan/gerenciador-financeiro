import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "income" | "expense";
};

export function KpiCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-xs",
        tone === "income" && "bg-emerald-50/50 dark:bg-emerald-950/20",
        tone === "expense" && "bg-rose-50/50 dark:bg-rose-950/20",
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "income" && "text-emerald-700 dark:text-emerald-300",
          tone === "expense" && "text-rose-700 dark:text-rose-300",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
