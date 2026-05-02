"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { lastNMonths, monthLabel } from "@/lib/dates";
import { capitalize } from "@/lib/format";

type Props = { paramName?: string; months?: number };

export function MonthPicker({ paramName = "month", months = 12 }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const value = params.get(paramName) ?? "";
  const list = lastNMonths(months);

  return (
    <Select
      value={value || "current"}
      onValueChange={(v) => {
        const url = new URLSearchParams(params?.toString() ?? "");
        if (v === "current") url.delete(paramName);
        else url.set(paramName, String(v));
        router.push(`?${url.toString()}`);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Mês" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current">Mês atual</SelectItem>
        {list.map((m) => {
          const v = `${m.year}-${String(m.month).padStart(2, "0")}`;
          return (
            <SelectItem key={v} value={v}>
              {capitalize(monthLabel(m.year, m.month))}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
