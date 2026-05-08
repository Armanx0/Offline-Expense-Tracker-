import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Searchbar,
  Text,
  useTheme
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ExpenseListItem } from "../../src/components/expenses/ExpenseListItem";
import { FilterChip } from "../../src/components/expenses/FilterChip";
import { useCategories } from "../../src/hooks/useCategories";
import { useInfiniteExpenses } from "../../src/hooks/useExpenses";

export default function ExpensesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const deferredSearch = useDeferredValue(search);
  const { data: categories = [] } = useCategories();
  const expenseQuery = useMemo(
    () => ({
      pageSize: 20,
      sort: "occurredAt_desc" as const,
      ...(deferredSearch ? { search: deferredSearch } : {}),
      ...(categoryId ? { categoryId } : {})
    }),
    [categoryId, deferredSearch]
  );
  const expenses = useInfiniteExpenses(expenseQuery);
  const items = useMemo(
    () => expenses.data?.pages.flatMap((page) => page.data.items) ?? [],
    [expenses.data]
  );
  const totalItems = expenses.data?.pages[0]?.meta.total ?? 0;

  if (expenses.isLoading && !expenses.data) {
    return <LoadingState label="Loading expenses..." />;
  }

  if (expenses.error && !expenses.data) {
    return (
      <ErrorState
        message={expenses.error.message}
        onRetry={() => void expenses.refetch()}
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
      <View style={styles.headerBlock}>
        <View style={{ gap: 6 }}>
          {/* <Text variant="headlineMedium">Expenses</Text> */}
          <Text variant="bodyMedium">
            Search, filter, and jump back into any transaction.
          </Text>
        </View>
        <Searchbar
          placeholder="Search descriptions"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {expenses.isFetching && !expenses.isFetchingNextPage ? (
          <ActivityIndicator size="small" />
        ) : null}
        <View style={styles.chipRow}>
          <FilterChip
            label="All"
            selected={!categoryId}
            onPress={() => setCategoryId(undefined)}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              leading={category.icon ?? "*"}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>
        {expenses.error && !items.length ? (
          <ErrorState
            message={expenses.error.message}
            onRetry={() => void expenses.refetch()}
          />
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        renderItem={({ item }) => (
          <ExpenseListItem
            expense={item}
            onPress={() => router.push(`/expense/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text variant="bodyMedium">
            {deferredSearch
              ? "No expenses match that description."
              : "No expenses match these filters."}
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {expenses.isFetchNextPageError ? (
              <ErrorState
                message={
                  expenses.error?.message ?? "Unable to load more expenses."
                }
                onRetry={() => void expenses.fetchNextPage()}
              />
            ) : null}
            {expenses.isFetchingNextPage ? (
              <ActivityIndicator size="small" />
            ) : null}
            {!expenses.isFetchingNextPage && expenses.hasNextPage ? (
              <Button
                mode="outlined"
                onPress={() => void expenses.fetchNextPage()}
              >
                Load more
              </Button>
            ) : null}
            {!expenses.hasNextPage && items.length > 0 ? (
              <Text variant="bodySmall">
                Showing all {items.length} of {totalItems} expenses.
              </Text>
            ) : null}
          </View>
        }
        onRefresh={() => void expenses.refetch()}
        refreshing={expenses.isRefetching && !expenses.isFetchingNextPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBlock: {
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 20
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  listContent: {
    gap: 8,
    paddingBottom: 60,
    paddingHorizontal: 20
  },
  footer: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 20,
    paddingTop: 8
  }
});
