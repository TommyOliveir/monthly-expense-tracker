import { Category } from "@/features/category/types/category";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  method?: string;
  date?: string;
  createdAt?: string;
}

// Shape returned when the API includes the category relation (e.g. budget summary)
export interface ExpenseWithCategory extends Expense {
  category: Category;
}

export interface CreateExpensePayload {
  name: string;
  amount: number;
  categoryId: string;
  method?: string;
  date?: string;
}

// Only the fields that changed are sent.
export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseFilters {
  year?: number;
  month?: number;
}
