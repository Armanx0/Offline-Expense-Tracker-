import { z } from "zod";

import { cuidSchema, isoDateTimeSchema } from "./common";

export const categoryColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6})$/);

export const categorySchema = z.object({
  id: cuidSchema,
  name: z.string().min(1).max(50),
  icon: z.string().max(8).nullable(),
  color: categoryColorSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export const createCategoryRequestSchema = z.object({
  name: z.string().trim().min(1).max(50),
  icon: z.string().trim().max(8).optional(),
  color: categoryColorSchema.optional()
});

export const updateCategoryRequestSchema = createCategoryRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required"
  }
);

export type CategoryDto = z.infer<typeof categorySchema>;
export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;
