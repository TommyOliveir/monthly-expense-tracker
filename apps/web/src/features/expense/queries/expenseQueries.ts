import { del, get, patch, post } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import {
  Expense,
  CreateExpensePayload,
  ExpenseFilters,
  UpdateExpensePayload,
} from "@/features/expense/types/expense";

export const expenseQueries = {
  all: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    // Pass year/month query params if provided
    const params = new URLSearchParams();
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.month) params.append("month", filters.month.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.expenses.list}?${queryString}`
      : ENDPOINTS.expenses.list;

    return await get<Expense[]>(endpoint);
  },

  create: async (payload: CreateExpensePayload): Promise<Expense> => {
    return await post<Expense, CreateExpensePayload>(
      ENDPOINTS.expenses.create ?? ENDPOINTS.expenses.list,
      payload,
    );
  },

  update: async (
    id: string,
    payload: UpdateExpensePayload,
  ): Promise<Expense> => {
    return await patch<Expense, UpdateExpensePayload>(
      ENDPOINTS.expenses.update(id),
      payload,
    );
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return await del<{ id: string }>(ENDPOINTS.expenses.delete(id));
  },
};
