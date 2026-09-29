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

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
  initial?: string;
  isDefault?: boolean;
}
