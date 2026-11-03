import type { Category } from "@/features/category/types/category";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-food",
    name: "Food",
    color: "#c96f4a",
    initial: "F",
    isDefault: false,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeExpense(
  overrides: Partial<ExpenseWithCategory> = {},
): ExpenseWithCategory {
  const category = overrides.category ?? makeCategory();
  return {
    id: "exp-1",
    name: "Lunch",
    amount: 12.5,
    categoryId: category.id,
    date: "2026-11-02T00:00:00.000Z",
    createdAt: "2026-11-02T08:00:00.000Z",
    ...overrides,
    category,
  };
}
