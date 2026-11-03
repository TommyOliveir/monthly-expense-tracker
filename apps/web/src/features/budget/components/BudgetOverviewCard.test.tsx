import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BudgetOverviewCard } from "@/features/budget/components/BudgetOverviewCard";

const baseProps = {
  currency: "PHP" as const,
  monthLabel: "November 2026",
  isReadOnly: false,
  onEditBudget: vi.fn(),
};

describe("BudgetOverviewCard", () => {
  it("prompts to set a budget instead of claiming 'over budget' when none exists", () => {
    const onEditBudget = vi.fn();
    render(
      <BudgetOverviewCard
        {...baseProps}
        onEditBudget={onEditBudget}
        budget={0}
        totalSpent={300}
        remaining={-300}
        status="unset"
      />,
    );

    expect(screen.getByText("No budget for November 2026")).toBeInTheDocument();
    expect(screen.queryByText("Over budget")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set budget" }));
    expect(onEditBudget).toHaveBeenCalled();
  });

  it("shows what's left when on track", () => {
    render(
      <BudgetOverviewCard
        {...baseProps}
        budget={1000}
        totalSpent={250}
        remaining={750}
        status="on-track"
      />,
    );

    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("₱750.00")).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "25",
    );
  });

  it("shows the overspend amount, not a negative remaining", () => {
    render(
      <BudgetOverviewCard
        {...baseProps}
        budget={1000}
        totalSpent={1200}
        remaining={-200}
        status="over"
      />,
    );

    expect(screen.getByText("Over budget by")).toBeInTheDocument();
    expect(screen.getByText("₱200.00")).toBeInTheDocument();
    expect(screen.getByText("Over budget")).toBeInTheDocument();
    expect(screen.getByText(/120%/)).toBeInTheDocument();
  });

  it("hides editing for past months", () => {
    render(
      <BudgetOverviewCard
        {...baseProps}
        isReadOnly
        budget={1000}
        totalSpent={250}
        remaining={750}
        status="on-track"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /budget/i }),
    ).not.toBeInTheDocument();
  });
});
