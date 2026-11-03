import type { CategoryTone } from "@/features/category/types/category";

const CATEGORY_TONES: CategoryTone[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

/** Derives the tone from the category id so a category keeps its color everywhere. */
export function getCategoryTone(categoryId: string): CategoryTone {
  let hash = 0;
  for (const character of categoryId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return CATEGORY_TONES[hash % CATEGORY_TONES.length];
}
