"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCents } from "@/lib/money";
import { titleCase } from "@/lib/format";

const COLORS = [
  "#0ea5e9",
  "#f97316",
  "#a855f7",
  "#22c55e",
  "#ec4899",
  "#facc15",
  "#14b8a6",
  "#6366f1",
  "#ef4444",
  "#84cc16",
];

type Datum = { key: string; label: string; totalCents: number };

export function CategoryDonut({ data }: { data: Datum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Sem despesas neste período.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCents"
            nameKey="label"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={((value: unknown, name: unknown) => [
              formatCents(Number(value)),
              titleCase(String(name ?? "")),
            ]) as never}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
