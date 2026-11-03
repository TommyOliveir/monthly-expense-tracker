import type { CategoryBreakdownItem } from "@/features/category/types/category";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";

export function buildCategoryBreakdown(
  expenses: ExpenseWithCategory[],
): CategoryBreakdownItem[] {
  const totalsByCategory = new Map<string, { name: string; total: number }>();
  let grandTotal = 0;

  for (const expense of expenses) {
    const entry = totalsByCategory.get(expense.categoryId) ?? {
      name: expense.category?.name ?? "Uncategorized",
      total: 0,
    };
    entry.total += expense.amount;
    grandTotal += expense.amount;
    totalsByCategory.set(expense.categoryId, entry);
  }

  return Array.from(totalsByCategory, ([categoryId, { name, total }]) => ({
    categoryId,
    name,
    total,
    share: grandTotal > 0 ? total / grandTotal : 0,
  })).sort((first, second) => second.total - first.total);
}
