import { formatCalendarDate } from "@/lib/format";
import type { ExpenseWithCategory } from "@/features/expense/types/expense";
import type { ExpenseDayGroup } from "@/features/expense/types/expenseForm";

function getExpenseDateKey(expense: ExpenseWithCategory): string {
  // Dates are stored as UTC midnight, so the UTC calendar date is the real one.
  return (expense.date ?? expense.createdAt ?? "").slice(0, 10);
}

function getPreviousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "Today";
  if (dateKey === getPreviousDateKey(todayKey)) return "Yesterday";
  return formatCalendarDate(`${dateKey}T00:00:00Z`);
}

/** Groups expenses by calendar day, newest day first. `todayKey` is the local "YYYY-MM-DD". */
export function groupExpensesByDay(
  expenses: ExpenseWithCategory[],
  todayKey: string,
): ExpenseDayGroup[] {
  const groups = new Map<string, ExpenseDayGroup>();

  for (const expense of expenses) {
    const dateKey = getExpenseDateKey(expense);
    const group = groups.get(dateKey) ?? {
      dateKey,
      label: dateKey ? getDayLabel(dateKey, todayKey) : "Undated",
      total: 0,
      expenses: [],
    };
    group.total += expense.amount;
    group.expenses.push(expense);
    groups.set(dateKey, group);
  }

  return Array.from(groups.values()).sort((first, second) =>
    second.dateKey.localeCompare(first.dateKey),
  );
}
