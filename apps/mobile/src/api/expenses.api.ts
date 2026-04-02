import type {
  CreateExpenseRequest,
  ExpenseDto,
  ListExpensesQuery,
  PaginatedResponse,
  UpdateExpenseRequest
} from "@expense-tracker/contracts";

import { offlineData } from "../data/offline-data";

export const getExpenses = (
  query: ListExpensesQuery
): Promise<PaginatedResponse<{ items: ExpenseDto[] }>> =>
  offlineData.getExpenses(query);

export const getExpense = (id: string): Promise<ExpenseDto> =>
  offlineData.getExpense(id);

export const createExpense = (
  payload: CreateExpenseRequest
): Promise<ExpenseDto> => offlineData.createExpense(payload);

export const updateExpense = (
  id: string,
  payload: UpdateExpenseRequest
): Promise<ExpenseDto> => offlineData.updateExpense(id, payload);

export const deleteExpense = (id: string): Promise<{ ok: true }> =>
  offlineData.deleteExpense(id);
