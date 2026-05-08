import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import type {
  CreateExpenseRequest,
  ListExpensesQuery,
  UpdateExpenseRequest
} from "../contracts";

import { offlineData } from "../data/offline-data";

const expenseKeys = {
  list: (query: ListExpensesQuery) => ["expenses", query] as const,
  infiniteList: (query: Omit<ListExpensesQuery, "page">) =>
    ["expenses", "infinite", query] as const,
  detail: (id: string) => ["expense", id] as const,
  dashboard: () => ["dashboard-overview"] as const
};

export const useExpenses = (query: ListExpensesQuery) =>
  useQuery({
    queryKey: expenseKeys.list(query),
    queryFn: () => offlineData.getExpenses(query),
    placeholderData: (previousData) => previousData
  });

export const useInfiniteExpenses = (query: Omit<ListExpensesQuery, "page">) =>
  useInfiniteQuery({
    queryKey: expenseKeys.infiniteList(query),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      offlineData.getExpenses({
        ...query,
        page: pageParam
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.pageCount
        ? lastPage.meta.page + 1
        : undefined,
    placeholderData: (previousData) => previousData
  });

export const useExpense = (id: string) =>
  useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => offlineData.getExpense(id),
    enabled: Boolean(id)
  });

const invalidateExpenseQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await queryClient.invalidateQueries({ queryKey: ["expenses"] });
  await queryClient.invalidateQueries({ queryKey: expenseKeys.dashboard() });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpenseRequest) =>
      offlineData.createExpense(payload),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
    }
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateExpenseRequest;
    }) => offlineData.updateExpense(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.id)
      });
      await invalidateExpenseQueries(queryClient);
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offlineData.deleteExpense(id),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
    }
  });
};
