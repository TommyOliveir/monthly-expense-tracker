import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseKeys } from "@/features/expense/queries/expenseKeys";
import { budgetKeys } from "@/features/budget/queries/budgetKeys";
import { expenseQueries } from "@/features/expense/queries/expenseQueries";
import type { UpdateExpensePayload } from "@/features/expense/types/expense";

type UpdateExpenseVariables = {
  id: string;
  payload: UpdateExpensePayload;
};

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  const {
    mutate: updateExpense,
    isPending: isUpdatingExpense,
    error: updateExpenseError,
  } = useMutation({
    mutationFn: ({ id, payload }: UpdateExpenseVariables) =>
      expenseQueries.update(id, payload),
    onSuccess: () => {
      // The budget summary carries the expense list and totals, so refresh both.
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });

  return {
    updateExpense,
    isUpdatingExpense,
    updateExpenseError,
  };
}
