"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

type Props = {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  triggerLabel?: string;
};

export function ComboboxHistory({
  options,
  value,
  onChange,
  placeholder = "Selecionar ou digitar…",
  emptyLabel = "Nada por aqui — pressione Enter para criar.",
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const showCreate = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return !options.some((o) => o.toLowerCase() === q);
  }, [query, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? titleCase(value) : (triggerLabel ?? placeholder)}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width,16rem)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            {value && (
              <CommandGroup heading="Atual">
                <CommandItem
                  value={`__clear__${value}`}
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="text-muted-foreground">Limpar seleção</span>
                </CommandItem>
              </CommandGroup>
            )}
            {options.length > 0 && (
              <CommandGroup heading="Histórico">
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {titleCase(opt)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup heading="Novo">
                <CommandItem
                  value={`__create__${query}`}
                  onSelect={() => {
                    onChange(query.trim().toLowerCase());
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  Criar &quot;{query.trim()}&quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
