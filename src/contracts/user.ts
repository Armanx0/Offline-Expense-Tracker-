import { z } from "zod";

import { currencyCodeSchema, cuidSchema } from "./common";

export const userSchema = z.object({
  id: cuidSchema,
  email: z.string().email(),
  name: z.string().min(1).max(80),
  currencyCode: currencyCodeSchema,
  timezone: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type UserDto = z.infer<typeof userSchema>;
