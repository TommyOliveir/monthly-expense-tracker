import React, { FC, useState } from "react";

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string; amount: string; category: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; amount: string; category: string }>
  >;
  categories: string[];
  defaultCategories: string[];
  onAddCategory: (name: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

const NEW_CATEGORY_VALUE = "__new__";

export const ExpenseModal: FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  categories,
  defaultCategories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  if (!isOpen) return null;

  function commitNewCategory() {
    const trimmed = newCategory.trim();

    if (!trimmed) {
      setCategoryError("Category name can't be empty.");
      return;
    }

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError("That category already exists.");
      return;
    }

    onAddCategory(trimmed);
    setForm((prev) => ({ ...prev, category: trimmed }));
    setIsAddingCategory(false);
    setNewCategory("");
    setCategoryError("");
  }

  function handleSaveEdit(oldName: string) {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null);
      return;
    }

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName,
      )
    ) {
      setCategoryError("Category already exists.");
      return;
    }

    onEditCategory(oldName, trimmed);
    if (form.category === oldName) {
      setForm((prev) => ({ ...prev, category: trimmed }));
    }
    setEditingCategory(null);
    setEditValue("");
    setCategoryError("");
  }

  function handleDelete(catName: string) {
    onDeleteCategory(catName);
    if (form.category === catName) {
      const fallback =
        categories.find((c) => c !== catName) || "Markets & dining";
      setForm((prev) => ({ ...prev, category: fallback }));
    }
  }

  function handleCategorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingCategory(true);
      setNewCategory("");
      setCategoryError("");
      return;
    }

    setIsAddingCategory(false);
    setForm((prev) => ({ ...prev, category: value }));
  }

  function handleModalClose() {
    setIsAddingCategory(false);
    setIsManaging(false);
    setEditingCategory(null);
    setNewCategory("");
    setCategoryError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2c2115]/40 backdrop-blur-sm"
        onClick={handleModalClose}
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

          {/* Category selection & creation */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="category"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
              >
                Category
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsManaging(!isManaging);
                  setIsAddingCategory(false);
                }}
                className="text-xs font-medium text-[#c96f4a] hover:underline"
              >
                {isManaging ? "Done managing" : "Manage categories"}
              </button>
            </div>

            {/* Manage Categories View */}
            {isManaging ? (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-2 rounded-xl border border-[#2c2115]/15 bg-[#faf5ec] p-3">
                {categories.map((cat) => {
                  const isDefault = defaultCategories.includes(cat);
                  const isEditing = editingCategory === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between gap-2 text-sm text-[#2c2115]"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 rounded-lg border border-[#2c2115]/20 px-2 py-1 text-xs outline-none focus:border-[#c96f4a]"
                        />
                      ) : (
                        <span className="truncate">
                          {cat}{" "}
                          {isDefault && (
                            <em className="text-xs text-[#8a7a63]">
                              (Default)
                            </em>
                          )}
                        </span>
                      )}

                      {!isDefault && (
                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(cat)}
                                className="text-xs font-medium text-[#5a6b3a] hover:underline"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="text-xs text-[#8a7a63] hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setEditValue(cat);
                                }}
                                className="text-xs text-[#8a7a63] hover:text-[#2c2115]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cat)}
                                className="text-xs text-[#a4522f] hover:underline"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !isAddingCategory ? (
              <select
                id="category"
                value={form.category}
                onChange={handleCategorySelect}
                className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
              </select>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      if (categoryError) setCategoryError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitNewCategory();
                      }
                      if (e.key === "Escape") {
                        setIsAddingCategory(false);
                        setNewCategory("");
                        setCategoryError("");
                      }
                    }}
                    placeholder="e.g. Travel"
                    className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
                  />

                  <button
                    type="button"
                    onClick={commitNewCategory}
                    className="shrink-0 rounded-xl bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a]"
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory("");
                      setCategoryError("");
                    }}
                    className="shrink-0 rounded-xl border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5"
                  >
                    Cancel
                  </button>
                </div>

                {categoryError && (
                  <p className="text-xs font-medium text-[#c96f4a]">
                    {categoryError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAddingCategory || isManaging}
              className="flex-1 rounded-full bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
