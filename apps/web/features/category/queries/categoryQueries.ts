import { del, get, patch, post } from "../../../api/client";
import { ENDPOINTS } from "../../../api/endpoints";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";

export const categoryQueries = {
  all: async (): Promise<Category[]> => {
    return await get<Category[]>(ENDPOINTS.categories.list);
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    return await post<Category, CreateCategoryPayload>(
      ENDPOINTS.categories.create ?? ENDPOINTS.categories.list,
      payload,
    );
  },

  delete: async (id: string): Promise<void> => {
    return await del<void>(
      ENDPOINTS.categories.delete
        ? ENDPOINTS.categories.delete(id)
        : `${ENDPOINTS.categories.list}/${id}`,
    );
  },

  update: async (
    id: string,
    payload: UpdateCategoryPayload,
  ): Promise<Category> => {
    return await patch<Category, UpdateCategoryPayload>(
      ENDPOINTS.categories.update(id),
      payload,
    );
  },
};
