"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCents } from "@/lib/money";
import { shortMonthLabel } from "@/lib/dates";

type Datum = {
  year: number;
  month: number;
  incomeCents: number;
  expenseCents: number;
};

export function TrendLine({ data }: { data: Datum[] }) {
  const chartData = data.map((d) => ({
    label: shortMonthLabel(d.year, d.month),
    Entradas: d.incomeCents,
    Despesas: d.expenseCents,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis
            tickFormatter={(v: number) => (v >= 100 ? `${Math.round(v / 100)}` : `${v / 100}`)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            width={40}
          />
          <Tooltip
            formatter={((v: unknown, name: unknown) => [
              formatCents(Number(v)),
              String(name ?? ""),
            ]) as never}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="Entradas"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Despesas"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
