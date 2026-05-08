import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { LoadingState } from "../src/components/common/LoadingState";
import { AppProviders } from "../src/providers/AppProviders";
import { useUserStore } from "../src/store/user.store";
import { useUiStore } from "../src/store/ui.store";

void SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const isHydrating = useUserStore((state) => state.isHydrating);
  const hydrate = useUserStore((state) => state.hydrate);
  const isUiHydrating = useUiStore((state) => state.isHydrating);
  const hydrateUi = useUiStore((state) => state.hydrate);

  useEffect(() => {
    void Promise.allSettled([hydrate(), hydrateUi()]).finally(() => {
      void SplashScreen.hideAsync();
    });
  }, [hydrate, hydrateUi]);

  if (isHydrating || isUiHydrating) {
    return <LoadingState label="Starting app..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="expense/new" />
      <Stack.Screen name="expense/[id]" />
      <Stack.Screen name="category/new" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigation />
    </AppProviders>
  );
}
