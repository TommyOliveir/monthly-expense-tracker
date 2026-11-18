import { LockIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { CurrencyCode } from "@/features/currency/currencies";
import { CurrencyPicker } from "@/features/currency/components/CurrencyPicker";
import { MonthSwitcher } from "@/features/tracker/components/MonthSwitcher";

type TrackerHeaderProps = {
  firstName?: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  isReadOnly: boolean;
  isSyncing?: boolean;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onAddExpense: () => void;
};

export function TrackerHeader({
  firstName,
  monthLabel,
  isCurrentMonth,
  isReadOnly,
  isSyncing = false,
  currency,
  onCurrencyChange,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  onAddExpense,
}: TrackerHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>{firstName ? `Hi, ${firstName}` : "Your monthly ledger"}</p>
          {isSyncing && (
            <span
              role="status"
              className="inline-flex items-center gap-1 text-xs"
            >
              <Spinner aria-hidden className="size-3" />
              Updating…
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {monthLabel}
          </h1>
          <MonthSwitcher
            showJumpToCurrent={!isCurrentMonth}
            onPrevious={onPreviousMonth}
            onNext={onNextMonth}
            onJumpToCurrent={onCurrentMonth}
          />
        </div>
        {isReadOnly && (
          <Badge variant="secondary" className="mt-3 h-6 gap-1.5 px-2.5">
            <LockIcon aria-hidden />
            Past month · view only
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {/* Shown for past months too: currency is a display preference, not an edit. */}
        <CurrencyPicker value={currency} onValueChange={onCurrencyChange} />
        {!isReadOnly && (
          <Button
            className="hidden h-10 px-4 sm:inline-flex"
            onClick={onAddExpense}
          >
            <PlusIcon aria-hidden />
            Add expense
          </Button>
        )}
      </div>
    </header>
  );
}
