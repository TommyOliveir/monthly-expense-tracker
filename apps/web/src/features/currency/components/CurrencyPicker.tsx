"use client";

import { ChevronDownIcon, CoinsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrencySymbol } from "@/lib/format";
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/features/currency/currencies";
import { CurrencyMenuItems } from "@/features/currency/components/CurrencyMenuItems";

type CurrencyPickerProps = {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
};

export function CurrencyPicker({ value, onValueChange }: CurrencyPickerProps) {
  const currencyName =
    SUPPORTED_CURRENCIES.find((currency) => currency.code === value)?.name ??
    value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-10 gap-1.5 px-3"
            aria-label={`Currency: ${currencyName}. Change currency`}
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
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-medium text-foreground">
              Display currency
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Changes how amounts are shown. Amounts aren&apos;t converted.
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <CurrencyMenuItems value={value} onValueChange={onValueChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
