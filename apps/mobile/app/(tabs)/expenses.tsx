import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Chip,
  Searchbar,
  Text
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ExpenseListItem } from "../../src/components/expenses/ExpenseListItem";
import { useCategories } from "../../src/hooks/useCategories";
import { useExpenses } from "../../src/hooks/useExpenses";

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const deferredSearch = useDeferredValue(search);
  const { data: categories = [] } = useCategories();
  const expenseQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 20,
      sort: "occurredAt_desc" as const,
      ...(deferredSearch ? { search: deferredSearch } : {}),
      ...(categoryId ? { categoryId } : {})
    }),
    [categoryId, deferredSearch]
  );
  const expenses = useExpenses(expenseQuery);

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
    <View style={{ flex: 1, paddingTop: Math.max(insets.top, 20) + 12 }}>
      <View style={{ gap: 12, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ gap: 6 }}>
          <Text variant="headlineMedium">Expenses</Text>
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
        {expenses.isFetching ? <ActivityIndicator size="small" /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Chip selected={!categoryId} onPress={() => setCategoryId(undefined)}>
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            >
              {category.icon ?? "*"} {category.name}
            </Chip>
          ))}
        </View>
        <Button mode="contained" onPress={() => router.push("/expense/new")}>
          Add expense
        </Button>
        {expenses.error ? (
          <ErrorState
            message={expenses.error.message}
            onRetry={() => void expenses.refetch()}
          />
        ) : null}
      </View>
      <FlatList
        data={expenses.data?.data.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 20,
          paddingBottom: 60
        }}
        keyboardShouldPersistTaps="handled"
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
        onRefresh={() => void expenses.refetch()}
        refreshing={expenses.isRefetching && !expenses.isFetching}
      />
    </View>
  );
}
