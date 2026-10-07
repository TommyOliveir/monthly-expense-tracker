import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseKeys } from "../queries/expenseKeys";
import { expenseQueries } from "../queries/expenseQueries";
import { CreateExpensePayload } from "../types/expense";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  const {
    mutate: createExpense,
    isPending: isCreatingExpense,
    error: createExpenseError,
    isSuccess,
  } = useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      expenseQueries.create(payload),
    onSuccess: () => {
      // Refresh expenses list & budget summary after adding an expense
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });

  return {
    createExpense,
    isCreatingExpense,
    createExpenseError,
    isSuccess,
  };
}
