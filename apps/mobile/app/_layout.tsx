import { useEffect } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { LoadingState } from "../src/components/common/LoadingState";
import { AppProviders } from "../src/providers/AppProviders";
import { useAuthStore } from "../src/store/auth.store";

void SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const segments = useSegments();
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate().finally(() => {
      void SplashScreen.hideAsync();
    });
  }, [hydrate]);

  if (isHydrating) {
    return <LoadingState label="Starting app..." />;
  }

  if (segments[0] === "(auth)") {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigation />
    </AppProviders>
  );
}
