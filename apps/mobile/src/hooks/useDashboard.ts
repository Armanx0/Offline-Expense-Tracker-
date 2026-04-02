import { useQuery } from "@tanstack/react-query";
import type { Period } from "@expense-tracker/contracts";

import { getDashboardOverview } from "../api/dashboard.api";

export const useDashboardOverview = (period: Period) =>
  useQuery({
    queryKey: ["dashboard-overview", period],
    queryFn: () => getDashboardOverview(period)
  });
