import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../queries/categoryKeys";
import { categoryQueries } from "../queries/categoryQueries";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const {
    mutate: deleteCategory,
    mutateAsync: deleteCategoryAsync,
    isPending: isDeletingCategory,
    error: deleteCategoryError,
    reset: resetDeleteCategory,
  } = useMutation({
    mutationFn: (id: string) => categoryQueries.delete(id), // Adjust to match your API method signature
    onSuccess: () => {
      // Invalidate category cache so UI reflects the deletion automatically
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });

  return {
    deleteCategory,
    deleteCategoryAsync,
    isDeletingCategory,
    deleteCategoryError,
    resetDeleteCategory,
  };
}
