import { z } from "zod";

import {
  currencyCodeSchema,
  cuidSchema,
  isoDateTimeSchema,
  sortSchema
} from "./common";
import { categorySchema } from "./categories";

export const expenseSchema = z.object({
  id: cuidSchema,
  amountMinor: z.number().int().positive(),
  currencyCode: currencyCodeSchema,
  description: z.string().nullable(),
  occurredAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  category: categorySchema
});

export const expenseListDataSchema = z.object({
  items: z.array(expenseSchema)
});

export const createExpenseRequestSchema = z.object({
  amountMinor: z.number().int().positive(),
  currencyCode: currencyCodeSchema.default("INR"),
  categoryId: cuidSchema,
  description: z.string().trim().max(500).optional(),
  occurredAt: isoDateTimeSchema.optional()
});

export const updateExpenseRequestSchema = createExpenseRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required"
  }
);

export const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  from: isoDateTimeSchema.optional(),
  to: isoDateTimeSchema.optional(),
  categoryId: cuidSchema.optional(),
  search: z.string().trim().max(100).optional(),
  sort: sortSchema.default("occurredAt_desc")
});

export type ExpenseDto = z.infer<typeof expenseSchema>;
export type ExpenseListData = z.infer<typeof expenseListDataSchema>;
export type CreateExpenseRequest = z.infer<typeof createExpenseRequestSchema>;
export type UpdateExpenseRequest = z.infer<typeof updateExpenseRequestSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
