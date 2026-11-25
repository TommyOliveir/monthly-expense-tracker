import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { budgetKeys } from "@/features/budget/queries/budgetKeys";
import { useUpdateCategory } from "@/features/category/hooks/useUpdateCategory";
import { categoryKeys } from "@/features/category/queries/categoryKeys";
import { categoryQueries } from "@/features/category/queries/categoryQueries";
import { makeCategory } from "@/test/fixtures";

describe("useUpdateCategory", () => {
  it("refreshes the categories and the budget summary that embeds them", async () => {
    vi.spyOn(categoryQueries, "update").mockResolvedValue(
      makeCategory({ name: "Groceries" }),
    );
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateCategory(), { wrapper });
    await act(() =>
      result.current.updateCategoryAsync({
        id: "category-1",
        payload: { name: "Groceries" },
      }),
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: categoryKeys.all,
    });
    // Expenses in the summary carry their category's name and colour.
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: budgetKeys.all,
    });
  });
});
