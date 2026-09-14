import React, { useState } from "react";

export interface BudgetModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Callback triggered when the new budget is submitted */
  onSave: (newBudget: number) => void;
  /** The currently active monthly budget */
  currentBudget: number;
  /** The total amount spent so far */
  totalSpent: number;
  /** Helper to format currency values (e.g., (val) => `$${val.toLocaleString()}`) */
  formatCurrency?: (value: number) => string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBudget,
  totalSpent,
  formatCurrency = (val) => `$${val.toFixed(2)}`,
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(
    currentBudget > 0 ? currentBudget.toString() : "",
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numericValue = parseFloat(budgetInput);
    if (!isNaN(numericValue) && numericValue > 0) {
      onSave(numericValue);
      onClose();
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
            How much would you like to spend this month?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-full bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a]"
            >
              Save budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
