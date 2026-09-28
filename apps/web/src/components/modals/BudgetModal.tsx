import React, { useState } from "react";
import { useSetBudget } from "../../../features/budget/hooks/useSetBudget";

export interface BudgetModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The currently active monthly budget */
  currentBudget: number;
  /** The total amount spent so far */
  totalSpent: number;
  /** Helper to format currency values */
  formatCurrency?: (value: number) => string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  totalSpent,
  formatCurrency = (val) => `$${val.toFixed(2)}`,
}) => {
  const { setBudget, isSettingBudget, setBudgetError } = useSetBudget();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const minMonthString = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [budgetInput, setBudgetInput] = useState<string>(
    currentBudget > 0 ? currentBudget.toString() : "",
  );
  const [selectedMonthYear, setSelectedMonthYear] =
    useState<string>(minMonthString);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numericValue = parseFloat(budgetInput);

    if (!isNaN(numericValue) && numericValue > 0 && selectedMonthYear) {
      const [yearStr, monthStr] = selectedMonthYear.split("-");

      setBudget(
        {
          amount: numericValue,
          year: parseInt(yearStr, 10),
          month: parseInt(monthStr, 10),
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2c2115]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 shadow-2xl">
        <div>
          <h2 className="font-display text-2xl font-medium text-[#2c2115]">
            Set monthly budget
          </h2>
          <p className="mt-1 text-sm text-[#8a7a63]">
            Select target month and budget amount.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Target Month & Year Input */}
          <div>
            <label
              htmlFor="target-month"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Target Month & Year
            </label>
            <input
              id="target-month"
              type="month"
              min={minMonthString}
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-3 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
              required
            />
            <p className="mt-1 text-xs text-[#8a7a63]">
              Past months cannot be modified.
            </p>
          </div>

          {/* Budget Input */}
          <div>
            <label
              htmlFor="budget"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Monthly budget
            </label>

            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7a63]">
                $
              </span>

              <input
                id="budget"
                type="number"
                min="1"
                step="0.01"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="8000"
                autoFocus
                className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] py-3 pl-8 pr-4 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
              />
            </div>
          </div>

          {/* Current budget preview */}
          <div className="rounded-2xl border border-[#2c2115]/10 bg-[#faf5ec] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8a7a63]">Current budget</span>
              <span className="font-semibold tabular-nums text-[#2c2115]">
                {formatCurrency(currentBudget)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[#8a7a63]">Already spent</span>
              <span className="font-semibold tabular-nums text-[#2c2115]">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {setBudgetError && (
            <p className="text-xs font-medium text-red-600">
              Failed to update budget. Please try again.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSettingBudget}
              className="flex-1 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSettingBudget}
              className="flex-1 rounded-full bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:opacity-50"
            >
              {isSettingBudget ? "Saving..." : "Save budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
