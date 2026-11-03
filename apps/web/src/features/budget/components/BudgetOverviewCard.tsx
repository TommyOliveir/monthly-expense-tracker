import { PencilIcon, PiggyBankIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BudgetStatusBadge } from "@/features/budget/components/BudgetStatusBadge";
import type { BudgetStatus } from "@/features/budget/types/budget";
import type { CurrencyCode } from "@/features/currency/currencies";

type BudgetOverviewCardProps = {
  budget: number;
  totalSpent: number;
  remaining: number;
  status: BudgetStatus;
  currency: CurrencyCode;
  monthLabel: string;
  isReadOnly: boolean;
  onEditBudget: () => void;
  className?: string;
};

const INDICATOR_CLASS: Record<Exclude<BudgetStatus, "unset">, string> = {
  "on-track": "[&_[data-slot=progress-indicator]]:bg-success",
  "near-limit": "[&_[data-slot=progress-indicator]]:bg-warning",
  over: "[&_[data-slot=progress-indicator]]:bg-destructive",
};

export function BudgetOverviewCard({
  budget,
  totalSpent,
  remaining,
  status,
  currency,
  monthLabel,
  isReadOnly,
  onEditBudget,
  className,
}: BudgetOverviewCardProps) {
  if (status === "unset") {
    return (
      <Card className={cn("justify-center gap-4 px-5 py-6 sm:px-7", className)}>
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand-foreground">
            <PiggyBankIcon aria-hidden className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-medium">
              No budget for {monthLabel}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isReadOnly
                ? "No budget was set for this month."
                : "Set a monthly budget to see how much you have left to spend."}
            </p>
            <p className="mt-3 text-sm">
              Spent so far:{" "}
              <span className="font-semibold tabular-nums">
                {formatCurrency(totalSpent, currency)}
              </span>
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <Button className="h-10 self-start px-4" onClick={onEditBudget}>
            Set budget
          </Button>
        )}
      </Card>
    );
  }

  const usedRatio = totalSpent / budget;
  const overspent = Math.max(0, totalSpent - budget);

  return (
    <Card className={cn("justify-between gap-5 px-5 py-6 sm:px-7", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground">
            {status === "over" ? "Over budget by" : "Remaining"}
          </h2>
          <p
            className={cn(
              "mt-1 font-display text-4xl font-medium tracking-tight tabular-nums break-all sm:text-5xl",
              status === "over" && "text-destructive",
            )}
          >
            {formatCurrency(
              status === "over" ? overspent : remaining,
              currency,
            )}
          </p>
        </div>
        <BudgetStatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-2">
        <Progress
          value={Math.min(100, usedRatio * 100)}
          aria-label="Budget used"
          getAriaValueText={() => `${formatPercent(usedRatio)} of budget used`}
          className={cn(
            "[&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-muted",
            INDICATOR_CLASS[status],
          )}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(totalSpent, currency)}
            </span>{" "}
            spent of{" "}
            <span className="tabular-nums">
              {formatCurrency(budget, currency)}
            </span>
            <span className="tabular-nums"> · {formatPercent(usedRatio)}</span>
          </p>
          {!isReadOnly && (
            <Button
              variant="outline"
              className="h-9 px-3"
              onClick={onEditBudget}
            >
              <PencilIcon aria-hidden />
              Edit budget
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
