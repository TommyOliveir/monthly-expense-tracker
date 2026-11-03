import type { ExpenseWithCategory } from "@/features/expense/types/expense";

export interface ExpenseFormValues {
  name: string;
  amount: string;
  categoryId: string;
  date: string;
}

export type ExpenseFormField = keyof ExpenseFormValues;

export type ExpenseFormErrors = Partial<Record<ExpenseFormField, string>>;

export interface ExpenseDayGroup {
  /** Calendar date as "YYYY-MM-DD". */
  dateKey: string;
  label: string;
  total: number;
  expenses: ExpenseWithCategory[];
}
