"use client";

import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCents, parseBRLToCents } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  valueCents: number | null;
  onChangeCents: (cents: number | null) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  ariaInvalid?: boolean;
};

export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { valueCents, onChangeCents, id, name, placeholder = "0,00", autoFocus, className, ariaInvalid },
  ref,
) {
  const [text, setText] = useState<string>(() =>
    valueCents != null ? formatRaw(valueCents) : "",
  );

  useEffect(() => {
    if (valueCents == null) {
      setText("");
    } else if (parseBRLToCents(text) !== valueCents) {
      setText(formatRaw(valueCents));
    }
  }, [valueCents, text]);

  return (
    <div className="space-y-1">
      <Input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const cents = parseBRLToCents(raw);
          onChangeCents(cents);
        }}
        onBlur={(e) => {
          const cents = parseBRLToCents(e.target.value);
          if (cents != null) {
            setText(formatRaw(cents));
            onChangeCents(cents);
          }
        }}
        className={cn("text-lg font-semibold", className)}
      />
      <div className="text-xs text-muted-foreground tabular-nums">
        {valueCents != null ? formatCents(valueCents) : "R$ 0,00"}
      </div>
    </div>
  );
});

function formatRaw(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
