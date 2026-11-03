import { formatMonthLabel } from "@/lib/format";
import { parseAmount } from "@/lib/money";
import { isDateInYearMonth, type YearMonth } from "@/lib/yearMonth";
import type { CreateExpensePayload } from "@/features/expense/types/expense";
import type {
  ExpenseFormErrors,
  ExpenseFormValues,
} from "@/features/expense/types/expenseForm";

const MAX_NAME_LENGTH = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ExpenseFormValidation =
  | { ok: true; payload: CreateExpensePayload }
  | { ok: false; errors: ExpenseFormErrors };

type ValidationContext = {
  categoryIds: string[];
  period: YearMonth;
};

function isRealCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function validateExpenseForm(
  values: ExpenseFormValues,
  { categoryIds, period }: ValidationContext,
): ExpenseFormValidation {
  const errors: ExpenseFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = "Describe what you spent on.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Keep it under ${MAX_NAME_LENGTH} characters.`;
  }

  const amount = parseAmount(values.amount);
  if (!amount.ok) {
    errors.amount = amount.error;
  }

  if (!values.categoryId) {
    errors.categoryId = "Choose a category.";
  } else if (!categoryIds.includes(values.categoryId)) {
    errors.categoryId = "That category no longer exists. Choose another one.";
  }

  if (!values.date || !isRealCalendarDate(values.date)) {
    errors.date = "Enter a valid date.";
  } else if (!isDateInYearMonth(values.date, period)) {
    errors.date = `Pick a date in ${formatMonthLabel(period)}.`;
  }

  if (!amount.ok || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: {
      name,
      amount: amount.value,
      categoryId: values.categoryId,
      date: values.date,
    },
  };
}
