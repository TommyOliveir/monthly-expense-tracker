import type {
  CreateExpensePayload,
  Expense,
  UpdateExpensePayload,
} from "@/features/expense/types/expense";

// Dates are stored as UTC midnight, so the UTC calendar date is the real one.
export function getExpenseDateInputValue(expense: Expense): string {
  return (expense.date ?? expense.createdAt ?? "").slice(0, 10);
}

/** The fields of the validated form that differ from the saved expense. */
export function getExpenseChanges(
  original: Expense,
  edited: CreateExpensePayload,
): UpdateExpensePayload {
  const changes: UpdateExpensePayload = {};

  if (edited.name !== original.name) changes.name = edited.name;
  if (edited.amount !== original.amount) changes.amount = edited.amount;
  if (edited.categoryId !== original.categoryId) {
    changes.categoryId = edited.categoryId;
  }
  if (edited.date && edited.date !== getExpenseDateInputValue(original)) {
    changes.date = edited.date;
  }

  return changes;
}
