import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

export type ThemePreference = "system" | "light" | "dark";

const sharedTheme = {
  roundness: 20
} as const;

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  ...sharedTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1D4ED8",
    onPrimary: "#F8FAFC",
    secondary: "#0F766E",
    onSecondary: "#F8FAFC",
    tertiary: "#C2410C",
    onTertiary: "#FFF7ED",
    background: "#F8F5EF",
    onBackground: "#1C1917",
    surface: "#FFFDF8",
    onSurface: "#1C1917",
    surfaceVariant: "#E7E1D7",
    onSurfaceVariant: "#5B5448",
    outline: "#8C857A",
    outlineVariant: "#D8D1C5",
    error: "#B91C1C",
    onError: "#FEF2F2"
  }
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  ...sharedTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#93C5FD",
    onPrimary: "#0F172A",
    secondary: "#5EEAD4",
    onSecondary: "#0F172A",
    tertiary: "#FDBA74",
    onTertiary: "#431407",
    background: "#111827",
    onBackground: "#F8FAFC",
    surface: "#18212F",
    onSurface: "#F8FAFC",
    surfaceVariant: "#263244",
    onSurfaceVariant: "#CBD5E1",
    outline: "#94A3B8",
    outlineVariant: "#334155",
    error: "#F87171",
    onError: "#450A0A"
  }
};
