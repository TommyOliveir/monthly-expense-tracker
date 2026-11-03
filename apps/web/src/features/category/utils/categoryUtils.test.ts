import { describe, expect, it } from "vitest";
import { buildCategoryBreakdown } from "@/features/category/utils/buildCategoryBreakdown";
import { getCategoryTone } from "@/features/category/utils/getCategoryTone";
import { validateCategoryName } from "@/features/category/utils/validateCategoryName";
import { makeCategory, makeExpense } from "@/test/fixtures";

describe("buildCategoryBreakdown", () => {
  it("returns nothing for no expenses", () => {
    expect(buildCategoryBreakdown([])).toEqual([]);
  });

  it("totals by category and sorts by spend", () => {
    const food = makeCategory({ id: "food", name: "Food" });
    const rent = makeCategory({ id: "rent", name: "Rent" });

    const breakdown = buildCategoryBreakdown([
      makeExpense({ id: "1", amount: 20, category: food }),
      makeExpense({ id: "2", amount: 60, category: rent }),
      makeExpense({ id: "3", amount: 20, category: food }),
    ]);

    expect(breakdown).toEqual([
      { categoryId: "rent", name: "Rent", total: 60, share: 0.6 },
      { categoryId: "food", name: "Food", total: 40, share: 0.4 },
    ]);
  });
});

describe("getCategoryTone", () => {
  it("is stable for the same id", () => {
    expect(getCategoryTone("abc-123")).toBe(getCategoryTone("abc-123"));
    expect(getCategoryTone("abc-123")).toMatch(/^chart-[1-5]$/);
  });
});

describe("validateCategoryName", () => {
  const existing = [makeCategory({ id: "1", name: "Travel" })];

  it("accepts and normalizes a new name", () => {
    expect(validateCategoryName("  Pet   care ", existing)).toEqual({
      ok: true,
      name: "Pet care",
    });
  });

  it("rejects empty and duplicate names", () => {
    expect(validateCategoryName("   ", existing)).toEqual({
      ok: false,
      error: "Enter a category name.",
    });
    expect(validateCategoryName("travel", existing)).toEqual({
      ok: false,
      error: "A category with that name already exists.",
    });
  });

  it("allows keeping the same name when renaming", () => {
    expect(validateCategoryName("Travel", existing, "1")).toEqual({
      ok: true,
      name: "Travel",
    });
  });
});
