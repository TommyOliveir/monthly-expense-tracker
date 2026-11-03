import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/features/category/queries/categoryKeys";
import { categoryQueries } from "@/features/category/queries/categoryQueries";
import { CreateCategoryPayload } from "@/features/category/types/category";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  const {
    mutate: createCategory,
    mutateAsync: createCategoryAsync,
    isPending: isCreatingCategory,
    error: createCategoryError,
    reset: resetCreateCategory,
  } = useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoryQueries.create(payload),
    onSuccess: () => {
      // Invalidate the category list cache so the UI automatically updates
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });

  return {
    createCategory,
    createCategoryAsync,
    isCreatingCategory,
    createCategoryError,
    resetCreateCategory,
  };
}
