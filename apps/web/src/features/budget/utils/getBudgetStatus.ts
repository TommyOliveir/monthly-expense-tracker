import type { BudgetStatus } from "@/features/budget/types/budget";

const NEAR_LIMIT_RATIO = 0.85;

export function getBudgetStatus(
  budget: number,
  totalSpent: number,
): BudgetStatus {
  if (budget <= 0) return "unset";
  if (totalSpent > budget) return "over";
  if (totalSpent >= budget * NEAR_LIMIT_RATIO) return "near-limit";
  return "on-track";
}
