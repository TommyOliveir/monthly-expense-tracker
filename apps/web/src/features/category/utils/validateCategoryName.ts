import type { Category } from "@/features/category/types/category";

const MAX_NAME_LENGTH = 50;

export type CategoryNameValidation =
  { ok: true; name: string } | { ok: false; error: string };

export function validateCategoryName(
  input: string,
  existingCategories: Category[],
  ignoreCategoryId?: string,
): CategoryNameValidation {
  const name = input.trim().replace(/\s+/g, " ");

  if (!name) {
    return { ok: false, error: "Enter a category name." };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_NAME_LENGTH} characters.` };
  }

  const isDuplicate = existingCategories.some(
    (category) =>
      category.id !== ignoreCategoryId &&
      category.name.toLowerCase() === name.toLowerCase(),
  );
  if (isDuplicate) {
    return { ok: false, error: "A category with that name already exists." };
  }

  return { ok: true, name };
}
