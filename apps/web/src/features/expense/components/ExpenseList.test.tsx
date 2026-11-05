import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpenseList } from "@/features/expense/components/ExpenseList";
import type { ExpenseDayGroup } from "@/features/expense/types/expenseForm";
import { makeExpense } from "@/test/fixtures";

const lunch = makeExpense({ id: "exp-1", name: "Lunch", amount: 12.5 });
const groups: ExpenseDayGroup[] = [
  { dateKey: "2026-11-02", label: "Today", total: 12.5, expenses: [lunch] },
];

describe("ExpenseList", () => {
  it("opens an expense when its row is tapped", () => {
    const onSelectExpense = vi.fn();
    render(
      <ExpenseList
        groups={groups}
        expenseCount={1}
        currency="PHP"
        emptyDescription="None"
        onSelectExpense={onSelectExpense}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Edit Lunch,/ }));

    expect(onSelectExpense).toHaveBeenCalledWith(lunch);
  });

  it("shows plain rows when editing is not allowed (past months)", () => {
    render(
      <ExpenseList
        groups={groups}
        expenseCount={1}
        currency="PHP"
        emptyDescription="None"
      />,
    );

    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
