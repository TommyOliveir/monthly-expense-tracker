import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "@/features/category/queries/categoryKeys";
import { categoryQueries } from "@/features/category/queries/categoryQueries";

export function useCategories() {
  const {
    data: categories = [],
    isPending: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryQueries.all(),
  });

  return {
    categories,
    isCategoriesLoading,
    categoriesError,
    refetchCategories,
  };
}
