import { create } from "zustand";
import type { UserDto } from "@expense-tracker/contracts";

import { offlineData } from "../data/offline-data";

interface AuthStore {
  user: UserDto | null;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isHydrating: true,
  hydrate: async () => {
    const user = await offlineData.getCurrentUser();
    set({
      user,
      isHydrating: false
    });
  },
  refreshUser: async () => {
    const user = await offlineData.getCurrentUser();
    set({
      user
    });
  }
}));
