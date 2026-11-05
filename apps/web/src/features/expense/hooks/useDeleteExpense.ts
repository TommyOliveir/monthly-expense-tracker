import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseKeys } from "@/features/expense/queries/expenseKeys";
import { budgetKeys } from "@/features/budget/queries/budgetKeys";
import { expenseQueries } from "@/features/expense/queries/expenseQueries";

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  const {
    mutate: deleteExpense,
    isPending: isDeletingExpense,
    error: deleteExpenseError,
  } = useMutation({
    mutationFn: (id: string) => expenseQueries.delete(id),
    onSuccess: () => {
      // The budget summary carries the expense list and totals, so refresh both.
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });

  return {
    deleteExpense,
    isDeletingExpense,
    deleteExpenseError,
  };
}
