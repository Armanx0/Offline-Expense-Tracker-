import { create } from "zustand";
import type { UserDto } from "../contracts";

import { offlineData } from "../data/offline-data";

interface UserStore {
  user: UserDto | null;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
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
