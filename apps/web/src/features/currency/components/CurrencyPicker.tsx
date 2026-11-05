"use client";

import { ChevronDownIcon, CoinsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrencySymbol } from "@/lib/format";
import {
  type CurrencyCode,
  getCurrencyName,
} from "@/features/currency/currencies";
import { CurrencyMenuContent } from "@/features/currency/components/CurrencyMenuContent";

type CurrencyPickerProps = {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
};

export function CurrencyPicker({ value, onValueChange }: CurrencyPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-10 gap-1.5 px-3"
            aria-label={`Currency: ${getCurrencyName(value)}. Change currency`}
          />
        }
      >
        <CoinsIcon aria-hidden className="text-brand-foreground" />
        <span aria-hidden className="text-muted-foreground">
          {getCurrencySymbol(value)}
        </span>
        <span className="font-medium tabular-nums">{value}</span>
        <ChevronDownIcon aria-hidden className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <CurrencyMenuContent value={value} onValueChange={onValueChange} />
    </DropdownMenu>
  );
}
