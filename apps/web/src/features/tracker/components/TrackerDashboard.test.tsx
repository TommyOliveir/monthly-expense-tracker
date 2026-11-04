import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import type { YearMonth } from "@/lib/yearMonth";
import type { IBudgetSummary } from "@/features/budget/types/budget";
import { TrackerDashboard } from "@/features/tracker/components/TrackerDashboard";
import { makeCategory, makeExpense } from "@/test/fixtures";

const CURRENT_MONTH: YearMonth = { year: 2026, month: 11 };

type BudgetSummaryState = {
  budgetSummary?: IBudgetSummary;
  isBudgetSummaryLoading: boolean;
  budgetSummaryError: Error | null;
  refetchBudgetSummary: () => void;
};

const setSelectedMonth = vi.fn();
const onCurrencyChange = vi.fn();
let selectedMonth: YearMonth = CURRENT_MONTH;
let budgetState: BudgetSummaryState;

vi.mock("@/features/tracker/hooks/useSelectedMonth", () => ({
  useSelectedMonth: () => ({
    selectedMonth,
    currentMonth: CURRENT_MONTH,
    setSelectedMonth,
  }),
}));
vi.mock("@/features/budget/hooks/useBudgetSummary", () => ({
  useBudgetSummary: () => budgetState,
}));
vi.mock("@/features/category/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [makeCategory()],
    isCategoriesLoading: false,
    categoriesError: null,
    refetchCategories: vi.fn(),
  }),
}));
vi.mock("@/features/expense/components/AddExpenseDialog", () => ({
  AddExpenseDialog: ({ open }: { open: boolean }) =>
    open ? <div>add-expense-dialog</div> : null,
}));
vi.mock("@/features/budget/components/SetBudgetDialog", () => ({
  SetBudgetDialog: ({ open }: { open: boolean }) =>
    open ? <div>set-budget-dialog</div> : null,
}));

function makeSummary(overrides: Partial<IBudgetSummary> = {}): IBudgetSummary {
  return {
    ...CURRENT_MONTH,
    budget: 0,
    totalSpent: 0,
    remaining: 0,
    expenses: [],
    ...overrides,
  };
}

describe("TrackerDashboard", () => {
  beforeEach(() => {
    selectedMonth = CURRENT_MONTH;
    setSelectedMonth.mockReset();
    budgetState = {
      budgetSummary: undefined,
      isBudgetSummaryLoading: false,
      budgetSummaryError: null,
      refetchBudgetSummary: vi.fn(),
    };
  });

  it("shows a loading state while the month loads", () => {
    budgetState.isBudgetSummaryLoading = true;
    render(
      <TrackerDashboard currency="USD" onCurrencyChange={onCurrencyChange} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading your month…");
  });

  it("shows an error with a retry when the month fails to load", () => {
    budgetState.budgetSummaryError = new ApiError(500, "boom");
    render(
      <TrackerDashboard currency="USD" onCurrencyChange={onCurrencyChange} />,
    );

    expect(screen.getByText("Couldn't load November 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(budgetState.refetchBudgetSummary).toHaveBeenCalled();
  });

  it("shows real empty states for a new month (no sample data)", () => {
    budgetState.budgetSummary = makeSummary();
    render(
      <TrackerDashboard
        firstName="Tommy"
        currency="USD"
        onCurrencyChange={onCurrencyChange}
      />,
    );

    expect(screen.getByText("Hi, Tommy")).toBeInTheDocument();
    expect(screen.getByText("No budget for November 2026")).toBeInTheDocument();
    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
    expect(screen.queryByText(/Sample Item/)).not.toBeInTheDocument();
  });

  it("renders the month's data in the selected currency", () => {
    budgetState.budgetSummary = makeSummary({
      budget: 1000,
      totalSpent: 312.5,
      remaining: 687.5,
      expenses: [
        makeExpense({ id: "1", name: "Groceries", amount: 300 }),
        makeExpense({ id: "2", name: "Coffee", amount: 12.5 }),
      ],
    });
    render(
      <TrackerDashboard currency="PHP" onCurrencyChange={onCurrencyChange} />,
    );

    expect(screen.getByText("₱687.50")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Currency: Philippine Peso. Change currency",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(
      screen.getByText("2 expenses", { selector: "[data-slot=card-action]" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Food").length).toBeGreaterThan(0);
  });

  it("opens the add-expense dialog from the header", () => {
    budgetState.budgetSummary = makeSummary();
    render(
      <TrackerDashboard currency="USD" onCurrencyChange={onCurrencyChange} />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Add expense" })[0]);
    expect(screen.getByText("add-expense-dialog")).toBeInTheDocument();
  });

  it("navigates between months", () => {
    budgetState.budgetSummary = makeSummary();
    render(
      <TrackerDashboard currency="USD" onCurrencyChange={onCurrencyChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(setSelectedMonth).toHaveBeenCalledWith({ year: 2026, month: 10 });
  });

  it("makes past months read-only", () => {
    selectedMonth = { year: 2026, month: 9 };
    budgetState.budgetSummary = makeSummary({ month: 9 });
    render(
      <TrackerDashboard currency="USD" onCurrencyChange={onCurrencyChange} />,
    );

    expect(screen.getByText("Past month · view only")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Currency: US Dollar/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add expense" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set budget" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "This month" }));
    expect(setSelectedMonth).toHaveBeenCalledWith(CURRENT_MONTH);
  });
});
