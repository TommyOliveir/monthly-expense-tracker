"use client";

import type { ComponentProps } from "react";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { CurrencyCode } from "@/features/currency/currencies";
import { CurrencyMenuItems } from "@/features/currency/components/CurrencyMenuItems";

type CurrencyMenuContentProps = Pick<
  ComponentProps<typeof DropdownMenuContent>,
  "align" | "finalFocus"
> & {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
};

export function CurrencyMenuContent({
  value,
  onValueChange,
  align = "end",
  finalFocus,
}: CurrencyMenuContentProps) {
  return (
    <DropdownMenuContent align={align} finalFocus={finalFocus} className="w-64">
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
  );
}
