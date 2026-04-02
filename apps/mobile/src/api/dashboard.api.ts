import type { DashboardOverview, Period } from "@expense-tracker/contracts";

import { offlineData } from "../data/offline-data";

export const getDashboardOverview = (
  period: Period
): Promise<DashboardOverview> => offlineData.getDashboardOverview(period);
