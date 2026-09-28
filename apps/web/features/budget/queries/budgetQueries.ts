// src/queries/budgetQueries.ts
import { get, post } from "../../../api/client";
import { ENDPOINTS } from "../../../api/endpoints";
import {
  BudgetSummaryParams,
  IBudgetSummary,
  SetBudgetPayload,
} from "../types/budget";

export const budgetQueries = {
  summary: async ({
    month,
    year,
  }: BudgetSummaryParams): Promise<IBudgetSummary> => {
    return await get<IBudgetSummary>(
      `${ENDPOINTS.budget.summary}?month=${month}&year=${year}`,
    );
  },

  setBudget: async (payload: SetBudgetPayload): Promise<IBudgetSummary> => {
    return await post<IBudgetSummary, SetBudgetPayload>(
      ENDPOINTS.budget.set,
      payload,
    );
  },
};
