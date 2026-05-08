import { router } from "expo-router";
import { Text } from "react-native-paper";

import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import { ExpenseForm } from "../../src/components/expenses/ExpenseForm";
import { useCreateExpense } from "../../src/hooks/useExpenses";
import { useUserStore } from "../../src/store/user.store";

export default function NewExpenseScreen() {
  const createExpense = useCreateExpense();
  const user = useUserStore((state) => state.user);

  return (
    <ScreenContainer>
      <Text variant="headlineMedium">New expense</Text>
      <Text variant="bodyMedium">
        Add the amount first, then choose the category and date.
      </Text>
      <ExpenseForm
        submitLabel="Save expense"
        isSubmitting={createExpense.isPending}
        onSubmit={async (payload) => {
          await createExpense.mutateAsync({
            ...payload,
            currencyCode: user?.currencyCode ?? "INR"
          });
          router.replace("/");
        }}
      />
    </ScreenContainer>
  );
}
