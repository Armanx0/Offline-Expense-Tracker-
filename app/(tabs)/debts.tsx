import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { DebtListItem } from "../../src/components/debts/DebtListItem";
import { DebtSummaryCards } from "../../src/components/debts/DebtSummaryCards";
import type { DebtDirection, DebtStatus } from "../../src/contracts";
import { useDebtSummary, useDebts } from "../../src/hooks/useDebts";

export default function DebtScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [direction, setDirection] = useState<DebtDirection>("given");
  const [status, setStatus] = useState<DebtStatus>("open");
  const debtQuery = useMemo(
    () => ({
      direction,
      status
    }),
    [direction, status]
  );
  const summary = useDebtSummary();
  const debts = useDebts(debtQuery);
  const items = debts.data ?? [];

  if (
    (summary.isLoading && !summary.data) ||
    (debts.isLoading && !debts.data)
  ) {
    return <LoadingState label="Loading debt records..." />;
  }

  if (summary.error) {
    return (
      <ErrorState
        message={summary.error.message}
        onRetry={() => void summary.refetch()}
      />
    );
  }

  if (debts.error) {
    return (
      <ErrorState
        message={debts.error.message}
        onRetry={() => void debts.refetch()}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 20) + 12
        }
      ]}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DebtListItem
            debt={item}
            onPress={() => router.push(`/debt/${item.id}` as Href)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.copyBlock}>
              <Text variant="headlineMedium">Debt Management</Text>
              <Text variant="bodyMedium">
                Track money you gave and money you need to pay back without
                mixing it into expenses.
              </Text>
            </View>
            {summary.data ? <DebtSummaryCards summary={summary.data} /> : null}
            <SegmentedButtons
              value={direction}
              onValueChange={(value) => setDirection(value)}
              buttons={[
                { value: "given", label: "Given" },
                { value: "taken", label: "Taken" }
              ]}
            />
            <SegmentedButtons
              value={status}
              onValueChange={(value) => setStatus(value)}
              buttons={[
                { value: "open", label: "Open" },
                { value: "settled", label: "History" }
              ]}
            />
            <Button
              mode="contained"
              onPress={() => router.push("/debt/new" as Href)}
            >
              Add debt
            </Button>
          </View>
        }
        ListEmptyComponent={
          <Text variant="bodyMedium">
            {status === "open"
              ? direction === "given"
                ? "No open given debts yet."
                : "No open taken debts yet."
              : direction === "given"
                ? "No settled given debts yet."
                : "No settled taken debts yet."}
          </Text>
        }
        onRefresh={() => {
          void Promise.allSettled([summary.refetch(), debts.refetch()]);
        }}
        refreshing={summary.isRefetching || debts.isRefetching}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBlock: {
    gap: 14,
    paddingBottom: 14
  },
  copyBlock: {
    gap: 6
  },
  listContent: {
    gap: 10,
    paddingBottom: 60,
    paddingHorizontal: 20
  }
});
