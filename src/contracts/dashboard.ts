import { z } from "zod";

import { currencyCodeSchema, isoDateTimeSchema, periodSchema } from "./common";
import { expenseSchema } from "./expenses";
import { categorySchema } from "./categories";

export const dashboardQuerySchema = z.object({
  period: periodSchema.default("week")
});

export const dashboardSummarySchema = z.object({
  totalAmountMinor: z.number().int().nonnegative(),
  transactionCount: z.number().int().nonnegative(),
  averageAmountMinor: z.number().int().nonnegative(),
  currencyCode: currencyCodeSchema
});

export const dashboardCategoryBreakdownSchema = z.object({
  category: categorySchema,
  amountMinor: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  count: z.number().int().nonnegative()
});

export const dashboardTimelinePointSchema = z.object({
  label: z.string().min(1),
  date: isoDateTimeSchema,
  amountMinor: z.number().int().nonnegative()
});

export const dashboardOverviewSchema = z.object({
  summary: dashboardSummarySchema,
  topCategories: z.array(dashboardCategoryBreakdownSchema),
  timeline: z.array(dashboardTimelinePointSchema),
  recentExpenses: z.array(expenseSchema)
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
export type DashboardCategoryBreakdown = z.infer<
  typeof dashboardCategoryBreakdownSchema
>;
export type DashboardTimelinePoint = z.infer<
  typeof dashboardTimelinePointSchema
>;
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
