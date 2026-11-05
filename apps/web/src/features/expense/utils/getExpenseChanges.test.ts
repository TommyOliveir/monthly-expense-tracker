import { describe, expect, it } from "vitest";
import {
  getExpenseChanges,
  getExpenseDateInputValue,
} from "@/features/expense/utils/getExpenseChanges";
import { makeExpense } from "@/test/fixtures";

const original = makeExpense({
  name: "Lunch",
  amount: 12.5,
  categoryId: "cat-food",
  date: "2026-11-02T00:00:00.000Z",
});

const unchanged = {
  name: "Lunch",
  amount: 12.5,
  categoryId: "cat-food",
  date: "2026-11-02",
};

describe("getExpenseDateInputValue", () => {
  it("uses the stored UTC calendar date", () => {
    expect(getExpenseDateInputValue(original)).toBe("2026-11-02");
  });
});

describe("getExpenseChanges", () => {
  it("returns nothing when the form matches the saved expense", () => {
    expect(getExpenseChanges(original, unchanged)).toEqual({});
  });

  it("returns only the fields that differ", () => {
    expect(
      getExpenseChanges(original, {
        ...unchanged,
        amount: 15,
        date: "2026-11-20",
      }),
    ).toEqual({ amount: 15, date: "2026-11-20" });
  });
});
