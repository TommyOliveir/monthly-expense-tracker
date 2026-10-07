export interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  method?: string;
  date?: string;
  createdAt?: string;
}

export interface CreateExpensePayload {
  name: string;
  amount: number;
  categoryId: string;
  method?: string;
  date?: string;
}

export interface ExpenseFilters {
  year?: number;
  month?: number;
}
