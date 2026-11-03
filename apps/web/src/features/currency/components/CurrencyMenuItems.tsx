"use client";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  type CurrencyCode,
  isCurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/features/currency/currencies";

type CurrencyMenuItemsProps = {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
};

export function CurrencyMenuItems({
  value,
  onValueChange,
}: CurrencyMenuItemsProps) {
  const handleValueChange = (next: unknown) => {
    if (isCurrencyCode(next)) onValueChange(next);
  };

  return (
    <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
      {SUPPORTED_CURRENCIES.map((currency) => (
        <DropdownMenuRadioItem
          key={currency.code}
          value={currency.code}
          closeOnClick
        >
          <span className="w-9 font-medium tabular-nums">{currency.code}</span>
          <span className="text-muted-foreground">{currency.name}</span>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}
