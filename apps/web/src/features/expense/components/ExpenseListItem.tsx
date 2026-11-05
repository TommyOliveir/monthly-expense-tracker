import { formatCurrency } from "@/lib/format";
import { CategoryAvatar } from "@/features/category/components/CategoryAvatar";
import { getCategoryTone } from "@/features/category/utils/getCategoryTone";
import type { CurrencyCode } from "@/features/currency/currencies";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";

type ExpenseListItemProps = {
  expense: ExpenseWithCategory;
  currency: CurrencyCode;
  /** Makes the row a button that opens the expense for editing. */
  onSelect?: (expense: ExpenseWithCategory) => void;
};

type ExpenseRowContentProps = {
  expense: ExpenseWithCategory;
  categoryName: string;
  formattedAmount: string;
};

function ExpenseRowContent({
  expense,
  categoryName,
  formattedAmount,
}: ExpenseRowContentProps) {
  return (
    <>
      <CategoryAvatar
        name={categoryName}
        tone={getCategoryTone(expense.categoryId)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.name}</p>
        <p className="truncate text-sm text-muted-foreground">{categoryName}</p>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {formattedAmount}
      </p>
    </>
  );
}

export function ExpenseListItem({
  expense,
  currency,
  onSelect,
}: ExpenseListItemProps) {
  const categoryName = expense.category?.name ?? "Uncategorized";
  const formattedAmount = formatCurrency(expense.amount, currency);
  const content = (
    <ExpenseRowContent
      expense={expense}
      categoryName={categoryName}
      formattedAmount={formattedAmount}
    />
  );

  if (!onSelect) {
    return <li className="flex items-center gap-3 py-3">{content}</li>;
  }

  return (
    <li className="py-1">
      <button
        type="button"
        onClick={() => onSelect(expense)}
        aria-label={`Edit ${expense.name}, ${formattedAmount}`}
        // Bleeds into the card padding so the hover/press area spans the row
        // without shifting the content's alignment.
        className="-mx-2 flex min-h-12 w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
      >
        {content}
      </button>
    </li>
  );
}
