import { describe, expect, it } from "vitest";
import { groupExpensesByDay } from "@/features/expense/utils/groupExpensesByDay";
import { validateExpenseForm } from "@/features/expense/utils/validateExpenseForm";
import { makeExpense } from "@/test/fixtures";

const context = {
  categoryIds: ["cat-food"],
  period: { year: 2026, month: 11 },
};

describe("validateExpenseForm", () => {
  it("builds the API payload from valid input", () => {
    const result = validateExpenseForm(
      {
        name: "  Lunch ",
        amount: "12.50",
        categoryId: "cat-food",
        date: "2026-11-03",
      },
      context,
    );

    expect(result).toEqual({
      ok: true,
      payload: {
        name: "Lunch",
        amount: 12.5,
        categoryId: "cat-food",
        date: "2026-11-03",
      },
    });
  });

  it("reports every invalid field at once", () => {
    const result = validateExpenseForm(
      { name: " ", amount: "", categoryId: "", date: "" },
      context,
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Describe what you spent on.",
        amount: "Enter an amount.",
        categoryId: "Choose a category.",
        date: "Enter a valid date.",
      },
    });
  });

  it("rejects dates outside the viewed month and impossible dates", () => {
    const outside = validateExpenseForm(
      {
        name: "Lunch",
        amount: "5",
        categoryId: "cat-food",
        date: "2026-12-01",
      },
      context,
    );
    const impossible = validateExpenseForm(
      {
        name: "Lunch",
        amount: "5",
        categoryId: "cat-food",
        date: "2026-11-31",
      },
      context,
    );

    expect(outside).toEqual({
      ok: false,
      errors: { date: "Pick a date in November 2026." },
    });
    expect(impossible).toEqual({
      ok: false,
      errors: { date: "Enter a valid date." },
    });
  });

  it("rejects a category that was deleted", () => {
    const result = validateExpenseForm(
      { name: "Lunch", amount: "5", categoryId: "gone", date: "2026-11-03" },
      context,
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        categoryId: "That category no longer exists. Choose another one.",
      },
    });
  });
});

describe("groupExpensesByDay", () => {
  it("returns no groups for no expenses", () => {
    expect(groupExpensesByDay([], "2026-11-03")).toEqual([]);
  });

  it("groups by UTC calendar day with friendly labels, newest first", () => {
    const groups = groupExpensesByDay(
      [
        makeExpense({ id: "a", amount: 10, date: "2026-11-01T00:00:00.000Z" }),
        makeExpense({ id: "b", amount: 5, date: "2026-11-03T00:00:00.000Z" }),
        makeExpense({ id: "c", amount: 7, date: "2026-11-02T00:00:00.000Z" }),
        makeExpense({ id: "d", amount: 3, date: "2026-11-03T00:00:00.000Z" }),
      ],
      "2026-11-03",
    );

    expect(
      groups.map((group) => [group.label, group.total, group.expenses.length]),
    ).toEqual([
      ["Today", 8, 2],
      ["Yesterday", 7, 1],
      ["Sun, Nov 1", 10, 1],
    ]);
  });
});
