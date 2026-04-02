import { router, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { Button } from "react-native-paper";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import { ExpenseForm } from "../../src/components/expenses/ExpenseForm";
import {
  useDeleteExpense,
  useExpense,
  useUpdateExpense
} from "../../src/hooks/useExpenses";
import { formatDisplayDate } from "../../src/utils/date.util";

export default function ExpenseDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const expense = useExpense(id ?? "");
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  if (!id) {
    return <ErrorState message="Expense not found" />;
  }

  if (expense.isLoading) {
    return <LoadingState label="Loading expense..." />;
  }

  if (expense.error || !expense.data) {
    return (
      <ErrorState message={expense.error?.message ?? "Expense not found"} />
    );
  }

  return (
    <ScreenContainer>
      <ExpenseForm
        initialValues={{
          amount: String(expense.data.amountMinor / 100),
          description: expense.data.description ?? "",
          occurredAt: new Date(expense.data.occurredAt),
          categoryId: expense.data.category.id
        }}
        submitLabel="Update expense"
        isSubmitting={updateExpense.isPending}
        onSubmit={async (payload) => {
          await updateExpense.mutateAsync({ id, payload });
          router.replace("/(tabs)/expenses");
        }}
      />
      <Button
        mode="outlined"
        textColor="#B91C1C"
        onPress={() => {
          Alert.alert(
            "Delete expense",
            `Delete expense from ${formatDisplayDate(expense.data.occurredAt)}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  void deleteExpense
                    .mutateAsync(id)
                    .then(() => router.replace("/(tabs)/expenses"));
                }
              }
            ]
          );
        }}
      >
        Delete expense
      </Button>
    </ScreenContainer>
  );
}
