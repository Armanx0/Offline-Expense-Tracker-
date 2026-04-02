import { router } from "expo-router";
import { View } from "react-native";
import { Button, SegmentedButtons, Text } from "react-native-paper";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import { RecentTransactions } from "../../src/components/dashboard/RecentTransactions";
import { SpendingTimeline } from "../../src/components/dashboard/SpendingTimeline";
import { SummaryCard } from "../../src/components/dashboard/SummaryCard";
import { TopCategoryList } from "../../src/components/dashboard/TopCategoryList";
import { useDashboardOverview } from "../../src/hooks/useDashboard";
import { useUiStore } from "../../src/store/ui.store";

export default function DashboardScreen() {
  const period = useUiStore((state) => state.dashboardPeriod);
  const setPeriod = useUiStore((state) => state.setDashboardPeriod);
  const overview = useDashboardOverview(period);

  return (
    <ScreenContainer>
      <View style={{ gap: 8 }}>
        <Text variant="headlineMedium">Overview</Text>
        <Text variant="bodyLarge">
          A quick read on where your money went this period.
        </Text>
      </View>
      <SegmentedButtons
        value={period}
        onValueChange={(value) => setPeriod(value)}
        buttons={[
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "year", label: "Year" },
          { value: "all", label: "All" }
        ]}
      />
      {overview.isLoading ? (
        <LoadingState label="Crunching your spending..." />
      ) : null}
      {overview.error ? (
        <ErrorState
          message={overview.error.message}
          onRetry={() => void overview.refetch()}
        />
      ) : null}
      {overview.data ? (
        <>
          <SummaryCard summary={overview.data.summary} />
          <SpendingTimeline
            timeline={overview.data.timeline}
            currencyCode={overview.data.summary.currencyCode}
          />
          <TopCategoryList
            categories={overview.data.topCategories}
            currencyCode={overview.data.summary.currencyCode}
          />
          <RecentTransactions expenses={overview.data.recentExpenses} />
          <Button mode="contained" onPress={() => router.push("/expense/new")}>
            Add expense
          </Button>
        </>
      ) : null}
    </ScreenContainer>
  );
}
