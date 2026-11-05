import type { ReactNode } from "react";
import { ReceiptTextIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/features/currency/currencies";
import { ExpenseListItem } from "@/features/expense/components/ExpenseListItem";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";
import type { ExpenseDayGroup } from "@/features/expense/types/expenseForm";

type ExpenseListProps = {
  groups: ExpenseDayGroup[];
  expenseCount: number;
  currency: CurrencyCode;
  emptyDescription: string;
  emptyAction?: ReactNode;
  /** When set, rows open the expense for editing. */
  onSelectExpense?: (expense: ExpenseWithCategory) => void;
  className?: string;
};

export function ExpenseList({
  groups,
  expenseCount,
  currency,
  emptyDescription,
  emptyAction,
  onSelectExpense,
  className,
}: ExpenseListProps) {
  return (
    <Card className={cn("gap-2 py-6", className)}>
      <CardHeader className="px-5 sm:px-6">
        <CardTitle className="font-display text-xl font-medium">
          Activity
        </CardTitle>
        {expenseCount > 0 && (
          <CardAction className="text-sm text-muted-foreground">
            {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {groups.length === 0 ? (
          <Empty className="border-0 px-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptTextIcon aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <section
                key={group.dateKey}
                aria-labelledby={`day-${group.dateKey}`}
              >
                <div className="flex items-baseline justify-between border-b py-2 text-xs font-medium text-muted-foreground">
                  <h3
                    id={`day-${group.dateKey}`}
                    className="uppercase tracking-wide"
                  >
                    {group.label}
                  </h3>
                  <span className="tabular-nums">
                    {formatCurrency(group.total, currency)}
                  </span>
                </div>
                <ul className="divide-y">
                  {group.expenses.map((expense) => (
                    <ExpenseListItem
                      key={expense.id}
                      expense={expense}
                      currency={currency}
                      onSelect={onSelectExpense}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
