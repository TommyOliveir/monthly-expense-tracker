"use client";

import React, { FC, useState } from "react";
import { useCategories } from "../../../features/category/hooks/useCategories";
import { useCreateCategory } from "../../../features/category/hooks/useCategory";
import { useDeleteCategory } from "../../../features/category/hooks/useDeleteCategory";
import { useUpdateCategory } from "../../../features/category/hooks/useUpdateCategory";

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { name: string; amount: string; categoryId: string; date?: string };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      amount: string;
      categoryId: string;
      date?: string;
    }>
  >;
}

const NEW_CATEGORY_VALUE = "__new__";

export const ExpenseModal: FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const { categories = [], isCategoriesLoading } = useCategories();
  const { createCategoryAsync, isCreatingCategory } = useCreateCategory();
  const { updateCategoryAsync, isUpdatingCategory } = useUpdateCategory();
  const { deleteCategoryAsync, isDeletingCategory } = useDeleteCategory();

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.id === form.categoryId);
  const isBusy = isCreatingCategory || isUpdatingCategory || isDeletingCategory;

  //add when cate has expesne

  // --- ADD CATEGORY ---
  const commitNewCategory = async () => {
    const trimmed = newCategory.trim();

    if (!trimmed) {
      setCategoryError("Category name can't be empty.");
      return;
    }

    if (
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCategoryError("That category already exists.");
      return;
    }

    try {
      const createdCategory = await createCategoryAsync({ name: trimmed });
      setForm((prev) => ({
        ...prev,
        categoryId: createdCategory?.id ?? prev.categoryId,
      }));
      setIsAddingCategory(false);
      setNewCategory("");
      setCategoryError("");
    } catch (err: any) {
      setCategoryError(
        err?.message || "Failed to create category. Please try again.",
      );
    }
  };

  // --- EDIT CATEGORY ---
  const startEditing = (catId: string, currentName: string) => {
    setEditingCategoryId(catId);
    setEditCategoryName(currentName);
    setCategoryError("");
  };

  const commitEditCategory = async (catId: string) => {
    const trimmed = editCategoryName.trim();

    if (!trimmed) {
      setCategoryError("Category name can't be empty.");
      return;
    }

    if (
      categories.some(
        (c) => c.id !== catId && c.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setCategoryError("That category name already exists.");
      return;
    }

    try {
      await updateCategoryAsync({
        id: catId,
        payload: { name: trimmed },
      });

      setEditingCategoryId(null);
      setEditCategoryName("");
      setCategoryError("");
    } catch (err: any) {
      setCategoryError(
        err?.message || "Failed to update category. Please try again.",
      );
    }
  };

  // --- DELETE CATEGORY ---
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${catName}"?`)) {
      return;
    }

    try {
      await deleteCategoryAsync(catId);
      const remaining = categories.filter((c) => c.id !== catId);
      if (form.categoryId === catId) {
        setForm((prev) => ({
          ...prev,
          categoryId: remaining.length > 0 ? remaining[0].id : "",
        }));
      }
      setCategoryError("");
    } catch (err: any) {
      setCategoryError(
        err?.message || "Failed to delete category. Please try again.",
      );
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingCategory(true);
      setIsManagingCategories(false);
      setNewCategory("");
      setCategoryError("");
      return;
    }

    setIsAddingCategory(false);
    setForm((prev) => ({ ...prev, categoryId: value }));
  };

  const handleModalClose = () => {
    setIsAddingCategory(false);
    setIsManagingCategories(false);
    setEditingCategoryId(null);
    setNewCategory("");
    setEditCategoryName("");
    setCategoryError("");
    onClose();
  };

  console.log("categories", categories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2c2115]/40 backdrop-blur-sm"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl font-medium text-[#2c2115]">
          Add expense
        </h2>

        <p className="mt-1 text-sm text-[#8a7a63]">
          Record a new transaction for your budget ledger.
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

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Date
            </label>

            <input
              id="date"
              type="date"
              value={form.date || new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
            />
          </div>

          {/* Category selection & management */}
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
                  setIsManagingCategories((prev) => !prev);
                  setIsAddingCategory(false);
                  setEditingCategoryId(null);
                  setCategoryError("");
                }}
                className="text-xs font-semibold text-[#c96f4a] hover:underline"
              >
                {isManagingCategories ? "Close Manager" : "Manage Categories"}
              </button>
            </div>

            {/* Default Dropdown View */}
            {!isAddingCategory && !isManagingCategories && (
              <div className="mt-2 flex gap-2">
                <select
                  id="category"
                  value={form.categoryId}
                  onChange={handleCategorySelect}
                  disabled={isCategoriesLoading || isBusy}
                  className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
                </select>
              </div>
            )}

            {/* Inline Add New Category Mode */}
            {isAddingCategory && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    disabled={isBusy}
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
                    className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={commitNewCategory}
                    disabled={isBusy}
                    className="shrink-0 rounded-xl bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:opacity-50"
                  >
                    {isCreatingCategory ? "Adding..." : "Add"}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory("");
                      setCategoryError("");
                    }}
                    className="shrink-0 rounded-xl border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Category Manager List Mode */}
            {isManagingCategories && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] p-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg bg-[#fffdf7] px-3 py-2 border border-[#2c2115]/10"
                  >
                    {editingCategoryId === cat.id ? (
                      <div className="flex w-full gap-2">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="w-full rounded-md border border-[#2c2115]/20 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => commitEditCategory(cat.id)}
                          disabled={isBusy}
                          className="rounded-md bg-[#2c2115] px-2 py-1 text-xs font-semibold text-[#faf5ec]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-[#2c2115]">
                          {cat.name}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(cat.id, cat.name)}
                            disabled={isBusy}
                            className="rounded-md border border-[#2c2115]/20 px-2 py-1 text-xs font-semibold text-[#2c2115] hover:bg-[#2c2115]/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCategory(cat.id, cat.name)
                            }
                            disabled={isBusy}
                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {categoryError && (
              <p className="mt-1.5 text-xs font-medium text-[#c96f4a]">
                {categoryError}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isBusy}
              className="flex-1 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAddingCategory || isManagingCategories || isBusy}
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
