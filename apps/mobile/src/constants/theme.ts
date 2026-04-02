import { MD3LightTheme, type MD3Theme } from "react-native-paper";

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1D4ED8",
    onPrimary: "#F8FAFC",
    secondary: "#0F766E",
    onSecondary: "#F8FAFC",
    tertiary: "#C2410C",
    background: "#F8F5EF",
    surface: "#FFFDF8",
    surfaceVariant: "#E7E1D7",
    outline: "#8C857A",
    error: "#B91C1C"
  },
  roundness: 20
};
