import { z } from "zod";

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);
export const isoDateTimeSchema = z.string().datetime();
export const cuidSchema = z.string().cuid();

export const periodSchema = z.enum(["week", "month", "year", "all"]);
export const sortSchema = z.enum([
  "occurredAt_desc",
  "occurredAt_asc",
  "amount_desc",
  "amount_asc"
]);

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative()
});

export const errorCodeSchema = z.enum([
  "RESOURCE_NOT_FOUND",
  "VALIDATION_ERROR",
  "CATEGORY_HAS_EXPENSES",
  "CATEGORY_NAME_TAKEN",
  "EXPENSE_INVALID_CATEGORY",
  "CONFLICT",
  "INTERNAL_ERROR"
]);

export const apiErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  details: z.unknown().optional()
});

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema
  });

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: paginationMetaSchema
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: apiErrorSchema
});

export type Period = z.infer<typeof periodSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T;
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}
