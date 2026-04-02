import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateExpenseRequest,
  ListExpensesQuery,
  UpdateExpenseRequest
} from "@expense-tracker/contracts";

import * as expensesApi from "../api/expenses.api";

const expenseKeys = {
  list: (query: ListExpensesQuery) => ["expenses", query] as const,
  detail: (id: string) => ["expense", id] as const,
  dashboard: () => ["dashboard-overview"] as const
};

export const useExpenses = (query: ListExpensesQuery) =>
  useQuery({
    queryKey: expenseKeys.list(query),
    queryFn: () => expensesApi.getExpenses(query),
    placeholderData: (previousData) => previousData
  });

export const useExpense = (id: string) =>
  useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expensesApi.getExpense(id),
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
      expensesApi.createExpense(payload),
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
    }) => expensesApi.updateExpense(id, payload),
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
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: async () => {
      await invalidateExpenseQueries(queryClient);
    }
  });
};
