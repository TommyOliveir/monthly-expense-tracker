export interface Category {
  id: string;
  name: string;
  color: string;
  initial: string;
  isDefault: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  color?: string;
  initial?: string;
  isDefault?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CategoryTone =
  "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  total: number;
  /** Fraction of total spending, from 0 to 1. */
  share: number;
}
