import type {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from "@expense-tracker/contracts";

import { offlineData } from "../data/offline-data";

export const getCategories = (): Promise<CategoryDto[]> =>
  offlineData.getCategories();

export const createCategory = (
  payload: CreateCategoryRequest
): Promise<CategoryDto> => offlineData.createCategory(payload);

export const updateCategory = (
  id: string,
  payload: UpdateCategoryRequest
): Promise<CategoryDto> => offlineData.updateCategory(id, payload);

export const deleteCategory = (id: string): Promise<{ ok: true }> =>
  offlineData.deleteCategory(id);
