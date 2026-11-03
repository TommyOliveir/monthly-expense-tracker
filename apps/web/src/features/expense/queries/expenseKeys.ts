import { ExpenseFilters } from "@/features/expense/types/expense";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters?: ExpenseFilters) =>
    [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};
