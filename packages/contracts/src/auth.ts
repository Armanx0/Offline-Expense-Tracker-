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

export const registerRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(128),
  currencyCode: currencyCodeSchema.default("INR"),
  timezone: z.string().trim().min(1).max(100).default("Asia/Kolkata")
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const refreshSessionRequestSchema = z.object({
  refreshToken: z.string().min(1)
});

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive()
});

export type UserDto = z.infer<typeof userSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
