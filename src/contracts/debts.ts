import { z } from "zod";

import { currencyCodeSchema, cuidSchema, isoDateTimeSchema } from "./common";

export const debtDirectionSchema = z.enum(["given", "taken"]);
export const debtStatusSchema = z.enum(["open", "settled"]);
export const debtEntryTypeSchema = z.enum(["initial", "increment", "payment"]);

export const debtEntrySchema = z.object({
  id: cuidSchema,
  type: debtEntryTypeSchema,
  amountMinor: z.number().int().positive(),
  occurredAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema
});

export const debtSchema = z.object({
  id: cuidSchema,
  personName: z.string().min(1).max(80),
  direction: debtDirectionSchema,
  currencyCode: currencyCodeSchema,
  dueDate: isoDateTimeSchema.nullable(),
  note: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  settledAt: isoDateTimeSchema.nullable(),
  status: debtStatusSchema,
  outstandingAmountMinor: z.number().int().nonnegative(),
  entries: z.array(debtEntrySchema)
});

export const debtListDataSchema = z.object({
  items: z.array(debtSchema)
});

export const debtSummarySchema = z.object({
  currencyCode: currencyCodeSchema,
  collectAmountMinor: z.number().int().nonnegative(),
  payAmountMinor: z.number().int().nonnegative(),
  openGivenCount: z.number().int().nonnegative(),
  openTakenCount: z.number().int().nonnegative()
});

export const createDebtRequestSchema = z.object({
  personName: z.string().trim().min(1).max(80),
  direction: debtDirectionSchema,
  amountMinor: z.number().int().positive(),
  currencyCode: currencyCodeSchema.default("INR"),
  dueDate: isoDateTimeSchema.optional(),
  note: z.string().trim().max(500).optional()
});

export const updateDebtMetadataRequestSchema = z
  .object({
    personName: z.string().trim().min(1).max(80).optional(),
    dueDate: isoDateTimeSchema.nullable().optional(),
    note: z.string().trim().max(500).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const addDebtAmountRequestSchema = z.object({
  amountMinor: z.number().int().positive(),
  occurredAt: isoDateTimeSchema.optional()
});

export const recordDebtPaymentRequestSchema = z.object({
  amountMinor: z.number().int().positive(),
  occurredAt: isoDateTimeSchema.optional()
});

export const listDebtsQuerySchema = z.object({
  direction: debtDirectionSchema.default("given"),
  status: debtStatusSchema.default("open"),
  search: z.string().trim().max(100).optional()
});

export type DebtDirection = z.infer<typeof debtDirectionSchema>;
export type DebtStatus = z.infer<typeof debtStatusSchema>;
export type DebtEntryType = z.infer<typeof debtEntryTypeSchema>;
export type DebtEntryDto = z.infer<typeof debtEntrySchema>;
export type DebtDto = z.infer<typeof debtSchema>;
export type DebtListData = z.infer<typeof debtListDataSchema>;
export type DebtSummary = z.infer<typeof debtSummarySchema>;
export type CreateDebtRequest = z.infer<typeof createDebtRequestSchema>;
export type UpdateDebtMetadataRequest = z.infer<
  typeof updateDebtMetadataRequestSchema
>;
export type AddDebtAmountRequest = z.infer<typeof addDebtAmountRequestSchema>;
export type RecordDebtPaymentRequest = z.infer<
  typeof recordDebtPaymentRequestSchema
>;
export type ListDebtsQuery = z.infer<typeof listDebtsQuerySchema>;
