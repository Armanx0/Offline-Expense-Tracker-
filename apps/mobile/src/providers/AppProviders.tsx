import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

import { appTheme } from "../constants/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export const AppProviders = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={appTheme}>{children}</PaperProvider>
    </QueryClientProvider>
  </SafeAreaProvider>
);
