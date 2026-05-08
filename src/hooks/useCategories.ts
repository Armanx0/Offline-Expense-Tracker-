import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest
} from "../contracts";

import { offlineData } from "../data/offline-data";

const categoriesKey = ["categories"] as const;

export const useCategories = () =>
  useQuery({
    queryKey: categoriesKey,
    queryFn: () => offlineData.getCategories()
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) =>
      offlineData.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKey });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateCategoryRequest;
    }) => offlineData.updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKey });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offlineData.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKey });
    }
  });
};
