// src/hooks/useCategories.ts

import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "../queries/categoryKeys";
import { categoryQueries } from "../queries/categoryQueries";

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
