import { useQuery } from "@tanstack/react-query";
import { BudgetSummaryParams } from "@/features/budget/types/budget";
import { budgetKeys } from "@/features/budget/queries/budgetKeys";
import { budgetQueries } from "@/features/budget/queries/budgetQueries";

export function useBudgetSummary(params: BudgetSummaryParams) {
  const {
    data: budgetSummary,
    isPending: isBudgetSummaryLoading,
    error: budgetSummaryError,
    refetch: refetchBudgetSummary,
  } = useQuery({
    queryKey: budgetKeys.summaryByMonth(params),
    queryFn: () => budgetQueries.summary(params),
  });

  return {
    budgetSummary,
    isBudgetSummaryLoading,
    budgetSummaryError,
    refetchBudgetSummary,
  };
}
