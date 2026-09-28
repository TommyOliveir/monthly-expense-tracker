export interface Expense {
  id?: string;
  name?: string;
  amount?: number;
  category?: string;
  date?: string;
  [key: string]: unknown;
}

export interface BudgetSummaryParams {
  month: number;
  year: number;
}

// Extend BudgetSummaryParams to avoid repeating month and year
export interface SetBudgetPayload extends BudgetSummaryParams {
  amount: number;
}

export interface IBudgetSummary extends BudgetSummaryParams {
  budget: number;
  totalSpent: number;
  remaining: number;
  expenses: Expense[];
}
