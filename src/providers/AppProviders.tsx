import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  ThemeProvider as NavigationThemeProvider,
  type Theme as NavigationTheme
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { StatusBar, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

import { darkTheme, lightTheme } from "../constants/theme";
import { useUiStore } from "../store/ui.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const systemColorScheme = useColorScheme();
  const themePreference = useUiStore((state) => state.themePreference);
  const isDarkTheme =
    themePreference === "dark" ||
    (themePreference === "system" && systemColorScheme === "dark");
  const paperTheme = isDarkTheme ? darkTheme : lightTheme;
  const navigationTheme = useMemo<NavigationTheme>(
    () => ({
      ...(isDarkTheme ? NavigationDarkTheme : NavigationLightTheme),
      colors: {
        ...(isDarkTheme ? NavigationDarkTheme : NavigationLightTheme).colors,
        background: paperTheme.colors.background,
        border: paperTheme.colors.outlineVariant,
        card: paperTheme.colors.surface,
        notification: paperTheme.colors.error,
        primary: paperTheme.colors.primary,
        text: paperTheme.colors.onSurface
      }
    }),
    [isDarkTheme, paperTheme]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar
          animated
          barStyle={isDarkTheme ? "light-content" : "dark-content"}
          backgroundColor={paperTheme.colors.background}
        />
        <View
          style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
        >
          {children}
        </View>
      </NavigationThemeProvider>
    </PaperProvider>
  );
};

export const AppProviders = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>{children}</AppThemeProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);
