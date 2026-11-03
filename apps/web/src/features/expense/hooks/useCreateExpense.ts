import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseKeys } from "@/features/expense/queries/expenseKeys";
import { expenseQueries } from "@/features/expense/queries/expenseQueries";
import { CreateExpensePayload } from "@/features/expense/types/expense";

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
