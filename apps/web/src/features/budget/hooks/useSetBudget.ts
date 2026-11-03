// src/hooks/useSetBudget.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SetBudgetPayload } from "@/features/budget/types/budget";
import { budgetKeys } from "@/features/budget/queries/budgetKeys";
import { budgetQueries } from "@/features/budget/queries/budgetQueries";

export function useSetBudget() {
  const queryClient = useQueryClient();

  const {
    mutate: setBudget,
    mutateAsync: setBudgetAsync,
    isPending: isSettingBudget,
    error: setBudgetError,
    reset: resetSetBudget,
  } = useMutation({
    mutationFn: (payload: SetBudgetPayload) => budgetQueries.setBudget(payload),
    onSuccess: () => {
      // Invalidate all budget queries so the summary hook automatically re-fetches
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });

  return {
    setBudget,
    setBudgetAsync,
    isSettingBudget,
    setBudgetError,
    resetSetBudget,
  };
}
