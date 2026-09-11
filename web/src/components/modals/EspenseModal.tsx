import React, { FC } from "react";

interface ExpenseFormState {
  name: string;
  amount: string; // CHANGED: Set to string to match parent component state
  category: string;
}

// ExpenseModal.tsx

interface ExpenseModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: ExpenseFormState;
  setForm: React.Dispatch<React.SetStateAction<ExpenseFormState>>;
  categories: string[];
}
export const ExpenseModal: FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  categories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2c2115]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 shadow-2xl">
        <h2 className="font-display text-2xl font-medium text-[#2c2115]">
          Add expense
        </h2>

        <p className="mt-1 text-sm text-[#8a7a63]">
          Record a new transaction for March 2025.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {/* Description */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Description
            </label>

            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Farmers market"
              className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Amount
            </label>

            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Category
            </label>

            <select
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              Save expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
