import { create } from "zustand";
import type { Period } from "@expense-tracker/contracts";

interface UiStore {
  dashboardPeriod: Period;
  setDashboardPeriod: (period: Period) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  dashboardPeriod: "month",
  setDashboardPeriod: (period) => {
    set({ dashboardPeriod: period });
  }
}));
