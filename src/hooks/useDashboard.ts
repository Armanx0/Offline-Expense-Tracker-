import { useQuery } from "@tanstack/react-query";
import type { Period } from "../contracts";

import { offlineData } from "../data/offline-data";

export const useDashboardOverview = (period: Period) =>
  useQuery({
    queryKey: ["dashboard-overview", period],
    queryFn: () => offlineData.getDashboardOverview(period)
  });
