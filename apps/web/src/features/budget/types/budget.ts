import { ExpenseWithCategory } from "@/features/expense/types/expense";

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
  expenses: ExpenseWithCategory[];
}

export type BudgetStatus = "unset" | "on-track" | "near-limit" | "over";
