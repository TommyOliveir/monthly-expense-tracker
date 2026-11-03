import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/features/category/queries/categoryKeys";
import { categoryQueries } from "@/features/category/queries/categoryQueries";
import { UpdateCategoryPayload } from "@/features/category/types/category";

interface UpdateCategoryParams {
  id: string;
  payload: UpdateCategoryPayload;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const {
    mutate: updateCategory,
    mutateAsync: updateCategoryAsync,
    isPending: isUpdatingCategory,
    error: updateCategoryError,
    reset: resetUpdateCategory,
  } = useMutation({
    mutationFn: ({ id, payload }: UpdateCategoryParams) =>
      categoryQueries.update(id, payload),
    onSuccess: () => {
      // Invalidate the category list cache so the UI automatically updates
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });

  return {
    updateCategory,
    updateCategoryAsync,
    isUpdatingCategory,
    updateCategoryError,
    resetUpdateCategory,
  };
}
