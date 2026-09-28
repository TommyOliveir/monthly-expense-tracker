import { BudgetSummaryParams } from "../types/budget";

export const budgetKeys = {
  all: ["budget"] as const,

  summary: () => [...budgetKeys.all, "summary"] as const,

  summaryByMonth: (params: BudgetSummaryParams) =>
    [...budgetKeys.summary(), params] as const,
};
