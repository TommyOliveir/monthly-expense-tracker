"use client";

import type { RefObject } from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { getCurrencySymbol } from "@/lib/format";
import {
  type CurrencyCode,
  getCurrencyName,
} from "@/features/currency/currencies";
import { CurrencyMenuContent } from "@/features/currency/components/CurrencyMenuContent";

type CurrencyInputAddonProps = {
  value: CurrencyCode;
  onValueChange: (currency: CurrencyCode) => void;
  /** Where focus lands when the menu closes, so the user can keep typing. */
  inputRef?: RefObject<HTMLInputElement | null>;
};

/**
 * Currency selector rendered as the leading segment of an `InputGroup`.
 * Changes the app-wide display currency; it does not tag the value with one.
 */
export function CurrencyInputAddon({
  value,
  onValueChange,
  inputRef,
}: CurrencyInputAddonProps) {
  return (
    <InputGroupAddon className="items-stretch self-stretch py-0 pr-1.5 pl-0 has-[>button]:ml-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <InputGroupButton
              aria-label={`Currency: ${getCurrencyName(value)}. Change currency`}
              // Fills the group's full height; the pseudo-element extends the
              // hit area over the group border to a 44px touch target.
              className="relative h-auto min-w-14 cursor-pointer gap-1 rounded-none rounded-l-[calc(var(--radius-lg)-1px)] border-0 border-r border-input bg-muted/50 px-3 transition-colors after:absolute after:inset-y-[-1px] after:left-[-1px] after:right-0 hover:bg-muted aria-expanded:bg-muted dark:bg-muted/30 dark:hover:bg-muted/60 dark:aria-expanded:bg-muted/60"
            />
          }
        >
          <span
            aria-hidden
            className="text-base font-medium text-foreground tabular-nums"
          >
            {getCurrencySymbol(value)}
          </span>
          <ChevronDownIcon
            aria-hidden
            className="size-3.5 text-muted-foreground"
          />
        </DropdownMenuTrigger>
        <CurrencyMenuContent
          align="start"
          value={value}
          onValueChange={onValueChange}
          finalFocus={inputRef ?? true}
        />
      </DropdownMenu>
    </InputGroupAddon>
  );
}
