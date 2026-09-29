// "use client";

// import React, { FC, useState } from "react";
// import { useCategories } from "../../../features/category/hooks/useCategories";
// import { useCreateCategory } from "../../../features/category/hooks/useCategory";

// export interface ExpenseModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (e: React.FormEvent) => void;
//   form: { name: string; amount: string; category: string };
//   setForm: React.Dispatch<
//     React.SetStateAction<{ name: string; amount: string; category: string }>
//   >;
// }

// const NEW_CATEGORY_VALUE = "__new__";

// export const ExpenseModal: FC<ExpenseModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   form,
//   setForm,
// }) => {
//   const [isAddingCategory, setIsAddingCategory] = useState(false);
//   const [newCategory, setNewCategory] = useState("");
//   const [categoryError, setCategoryError] = useState("");

//   const { categories, isCategoriesLoading } = useCategories();
//   const { createCategoryAsync, isCreatingCategory } = useCreateCategory();

//   if (!isOpen) return null;

//   const commitNewCategory = async () => {
//     const trimmed = newCategory.trim();

//     if (!trimmed) {
//       setCategoryError("Category name can't be empty.");
//       return;
//     }

//     if (
//       categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
//     ) {
//       setCategoryError("That category already exists.");
//       return;
//     }

//     try {
//       // Call mutation to persist new category
//       const createdCategory = await createCategoryAsync({ name: trimmed });

//       // Update local form state with newly created category name (or ID, depending on form setup)
//       setForm((prev) => ({
//         ...prev,
//         category: createdCategory?.name ?? trimmed,
//       }));

//       setIsAddingCategory(false);
//       setNewCategory("");
//       setCategoryError("");
//     } catch (err: any) {
//       setCategoryError(
//         err?.message || "Failed to create category. Please try again.",
//       );
//     }
//   };

//   const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value;

//     if (value === NEW_CATEGORY_VALUE) {
//       setIsAddingCategory(true);
//       setNewCategory("");
//       setCategoryError("");
//       return;
//     }

//     setIsAddingCategory(false);
//     setForm((prev) => ({ ...prev, category: value }));
//   };

//   const handleModalClose = () => {
//     setIsAddingCategory(false);
//     setNewCategory("");
//     setCategoryError("");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-[#2c2115]/40 backdrop-blur-sm"
//         onClick={handleModalClose}
//         aria-hidden="true"
//       />

//       {/* Modal Card */}
//       <div className="relative w-full max-w-md rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 shadow-2xl">
//         <h2 className="font-display text-2xl font-medium text-[#2c2115]">
//           Add expense
//         </h2>

//         <p className="mt-1 text-sm text-[#8a7a63]">
//           Record a new transaction for your budget ledger.
//         </p>

//         <form onSubmit={onSubmit} className="mt-5 space-y-4">
//           {/* Description */}
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
//             >
//               Description
//             </label>

//             <input
//               id="name"
//               type="text"
//               required
//               value={form.name}
//               onChange={(e) =>
//                 setForm((prev) => ({ ...prev, name: e.target.value }))
//               }
//               placeholder="e.g. Farmers market"
//               className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
//             />
//           </div>

//           {/* Amount */}
//           <div>
//             <label
//               htmlFor="amount"
//               className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
//             >
//               Amount
//             </label>

//             <input
//               id="amount"
//               type="number"
//               step="0.01"
//               min="0"
//               required
//               value={form.amount}
//               onChange={(e) =>
//                 setForm((prev) => ({ ...prev, amount: e.target.value }))
//               }
//               placeholder="0.00"
//               className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
//             />
//           </div>

//           {/* Category selection */}
//           <div>
//             <label
//               htmlFor="category"
//               className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
//             >
//               Category
//             </label>

//             {!isAddingCategory ? (
//               <select
//                 id="category"
//                 value={form.category}
//                 onChange={handleCategorySelect}
//                 disabled={isCategoriesLoading}
//                 className="mt-2 w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
//               >
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.name}>
//                     {cat.name}
//                   </option>
//                 ))}
//                 <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
//               </select>
//             ) : (
//               <div className="mt-2 space-y-2">
//                 <div className="flex gap-2">
//                   <input
//                     autoFocus
//                     type="text"
//                     disabled={isCreatingCategory}
//                     value={newCategory}
//                     onChange={(e) => {
//                       setNewCategory(e.target.value);
//                       if (categoryError) setCategoryError("");
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         commitNewCategory();
//                       }
//                       if (e.key === "Escape") {
//                         setIsAddingCategory(false);
//                         setNewCategory("");
//                         setCategoryError("");
//                       }
//                     }}
//                     placeholder="e.g. Travel"
//                     className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
//                   />

//                   <button
//                     type="button"
//                     onClick={commitNewCategory}
//                     disabled={isCreatingCategory}
//                     className="shrink-0 rounded-xl bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:opacity-50"
//                   >
//                     {isCreatingCategory ? "Adding..." : "Add"}
//                   </button>

//                   <button
//                     type="button"
//                     disabled={isCreatingCategory}
//                     onClick={() => {
//                       setIsAddingCategory(false);
//                       setNewCategory("");
//                       setCategoryError("");
//                     }}
//                     className="shrink-0 rounded-xl border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
//                   >
//                     Cancel
//                   </button>
//                 </div>

//                 {categoryError && (
//                   <p className="text-xs font-medium text-[#c96f4a]">
//                     {categoryError}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Modal Actions */}
//           <div className="flex gap-3 pt-2">
//             <button
//               type="button"
//               onClick={handleModalClose}
//               disabled={isCreatingCategory}
//               className="flex-1 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isAddingCategory || isCreatingCategory}
//               className="flex-1 rounded-full bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Save expense
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
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
  form: { name: string; amount: string; category: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; amount: string; category: string }>
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
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const { categories = [], isCategoriesLoading } = useCategories();
  const { createCategoryAsync, isCreatingCategory } = useCreateCategory();
  const { updateCategoryAsync, isUpdatingCategory } = useUpdateCategory();
  const { deleteCategoryAsync, isDeletingCategory } = useDeleteCategory();

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.name === form.category);
  const isBusy = isCreatingCategory || isUpdatingCategory || isDeletingCategory;

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
        category: createdCategory?.name ?? trimmed,
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
  const startEditing = () => {
    if (!currentCategoryObj) return;
    setEditCategoryName(currentCategoryObj.name);
    setIsEditingCategory(true);
    setCategoryError("");
  };

  const commitEditCategory = async () => {
    if (!currentCategoryObj) return;
    const trimmed = editCategoryName.trim();

    if (!trimmed) {
      setCategoryError("Category name can't be empty.");
      return;
    }

    if (
      trimmed.toLowerCase() !== currentCategoryObj.name.toLowerCase() &&
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCategoryError("That category already exists.");
      return;
    }

    try {
      const updatedCategory = await updateCategoryAsync({
        id: currentCategoryObj.id,
        payload: { name: trimmed },
      });

      setForm((prev) => ({
        ...prev,
        category: updatedCategory?.name ?? trimmed,
      }));
      setIsEditingCategory(false);
      setEditCategoryName("");
      setCategoryError("");
    } catch (err: any) {
      setCategoryError(
        err?.message || "Failed to update category. Please try again.",
      );
    }
  };

  // --- DELETE CATEGORY ---
  const handleDeleteCategory = async () => {
    if (!currentCategoryObj) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${currentCategoryObj.name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteCategoryAsync(currentCategoryObj.id);
      const remaining = categories.filter(
        (c) => c.id !== currentCategoryObj.id,
      );
      setForm((prev) => ({
        ...prev,
        category: remaining.length > 0 ? remaining[0].name : "",
      }));
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
      setIsEditingCategory(false);
      setNewCategory("");
      setCategoryError("");
      return;
    }

    setIsAddingCategory(false);
    setIsEditingCategory(false);
    setForm((prev) => ({ ...prev, category: value }));
  };

  const handleModalClose = () => {
    setIsAddingCategory(false);
    setIsEditingCategory(false);
    setNewCategory("");
    setEditCategoryName("");
    setCategoryError("");
    onClose();
  };

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

          {/* Category selection & controls */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
            >
              Category
            </label>

            {!isAddingCategory && !isEditingCategory ? (
              <div className="mt-2 flex gap-2">
                <select
                  id="category"
                  value={form.category}
                  onChange={handleCategorySelect}
                  disabled={isCategoriesLoading || isBusy}
                  className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
                </select>

                {currentCategoryObj && (
                  <>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={startEditing}
                      disabled={isBusy}
                      title="Edit selected category"
                      className="shrink-0 rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-3 py-2.5 text-xs font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/10 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={handleDeleteCategory}
                      disabled={isBusy}
                      title="Delete selected category"
                      className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {isDeletingCategory ? "..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            ) : isEditingCategory ? (
              /* Inline Edit Mode */
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    disabled={isBusy}
                    value={editCategoryName}
                    onChange={(e) => {
                      setEditCategoryName(e.target.value);
                      if (categoryError) setCategoryError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitEditCategory();
                      }
                      if (e.key === "Escape") {
                        setIsEditingCategory(false);
                        setEditCategoryName("");
                        setCategoryError("");
                      }
                    }}
                    placeholder="Category name"
                    className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] px-4 py-2.5 text-sm text-[#2c2115] outline-none transition focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={commitEditCategory}
                    disabled={isBusy}
                    className="shrink-0 rounded-xl bg-[#2c2115] px-4 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a] disabled:opacity-50"
                  >
                    {isUpdatingCategory ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setIsEditingCategory(false);
                      setEditCategoryName("");
                      setCategoryError("");
                    }}
                    className="shrink-0 rounded-xl border border-[#2c2115]/20 px-4 py-2.5 text-sm font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Inline Add Mode */
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
              disabled={isAddingCategory || isEditingCategory || isBusy}
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
