"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCents } from "@/lib/money";

type Datum = { day: string; totalCents: number };

export function DailyBar({ data }: { data: Datum[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="day"
            tickFormatter={(d: string) => String(Number(d.slice(-2)))}
            stroke="var(--muted-foreground)"
            fontSize={11}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v: number) => (v >= 100 ? `${Math.round(v / 100)}` : `${v / 100}`)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            width={32}
          />
          <Tooltip
            formatter={((v: unknown) => [formatCents(Number(v)), "Despesas"]) as never}
            labelFormatter={(d) => `Dia ${String(d).slice(-2)}`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="totalCents" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
