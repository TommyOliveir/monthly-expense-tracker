import { formatCurrency } from "@/lib/format";
import { CategoryAvatar } from "@/features/category/components/CategoryAvatar";
import { getCategoryTone } from "@/features/category/utils/getCategoryTone";
import type { CurrencyCode } from "@/features/currency/currencies";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";

type ExpenseListItemProps = {
  expense: ExpenseWithCategory;
  currency: CurrencyCode;
};

export function ExpenseListItem({ expense, currency }: ExpenseListItemProps) {
  const categoryName = expense.category?.name ?? "Uncategorized";

  return (
    <li className="flex items-center gap-3 py-3">
      <CategoryAvatar
        name={categoryName}
        tone={getCategoryTone(expense.categoryId)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.name}</p>
        <p className="truncate text-sm text-muted-foreground">{categoryName}</p>
      </div>
      <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {formatCurrency(expense.amount, currency)}
      </p>
    </li>
  );
}
