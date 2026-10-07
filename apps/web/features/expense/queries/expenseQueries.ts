import { del, get, patch, post } from "../../../api/client";
import { ENDPOINTS } from "../../../api/endpoints";
import {
  Expense,
  CreateExpensePayload,
  ExpenseFilters,
} from "../types/expense";

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

  delete: async (id: string): Promise<void> => {
    return await del<void>(
      ENDPOINTS.expenses.delete
        ? ENDPOINTS.expenses.delete(id)
        : `${ENDPOINTS.expenses.list}/${id}`,
    );
  },
};
