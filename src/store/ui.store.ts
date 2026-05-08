import * as FileSystem from "expo-file-system";
import { create } from "zustand";
import type { Period } from "../contracts";

import type { ThemePreference } from "../constants/theme";

interface UiPreferences {
  themePreference: ThemePreference;
}

interface UiStore {
  dashboardPeriod: Period;
  themePreference: ThemePreference;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setDashboardPeriod: (period: Period) => void;
  setThemePreference: (themePreference: ThemePreference) => Promise<void>;
}

const defaultPreferences: UiPreferences = {
  themePreference: "system"
};

const getPreferencesDirectory = () => {
  if (!FileSystem.documentDirectory) {
    return null;
  }

  return `${FileSystem.documentDirectory}expense-tracker/`;
};

const getPreferencesPath = () => {
  const directory = getPreferencesDirectory();

  if (!directory) {
    return null;
  }

  return `${directory}ui-preferences.json`;
};

const normalizeThemePreference = (
  themePreference: unknown
): ThemePreference => {
  if (
    themePreference === "light" ||
    themePreference === "dark" ||
    themePreference === "system"
  ) {
    return themePreference;
  }

  return defaultPreferences.themePreference;
};

const readPreferences = async (): Promise<UiPreferences> => {
  const preferencesPath = getPreferencesPath();

  if (!preferencesPath) {
    return defaultPreferences;
  }

  try {
    const info = await FileSystem.getInfoAsync(preferencesPath);

    if (!info.exists) {
      return defaultPreferences;
    }

    const rawValue = await FileSystem.readAsStringAsync(preferencesPath);
    const parsed = JSON.parse(rawValue) as Partial<UiPreferences>;

    return {
      themePreference: normalizeThemePreference(parsed.themePreference)
    };
  } catch {
    return defaultPreferences;
  }
};

const writePreferences = async (preferences: UiPreferences) => {
  const preferencesDirectory = getPreferencesDirectory();
  const preferencesPath = getPreferencesPath();

  if (!preferencesDirectory || !preferencesPath) {
    return;
  }

  await FileSystem.makeDirectoryAsync(preferencesDirectory, {
    intermediates: true
  });
  await FileSystem.writeAsStringAsync(
    preferencesPath,
    JSON.stringify(preferences)
  );
};

export const useUiStore = create<UiStore>((set) => ({
  dashboardPeriod: "week",
  themePreference: defaultPreferences.themePreference,
  isHydrating: true,
  hydrate: async () => {
    const preferences = await readPreferences();
    set({
      themePreference: preferences.themePreference,
      isHydrating: false
    });
  },
  setDashboardPeriod: (period) => {
    set({ dashboardPeriod: period });
  },
  setThemePreference: async (themePreference) => {
    set({ themePreference });
    await writePreferences({ themePreference });
  }
}));
