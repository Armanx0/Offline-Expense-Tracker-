import { router, type Href } from "expo-router";
import { Alert } from "react-native";
import { Text } from "react-native-paper";

import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import { DebtForm } from "../../src/components/debts/DebtForm";
import { useCreateDebt } from "../../src/hooks/useDebts";
import { useUserStore } from "../../src/store/user.store";

export default function NewDebtScreen() {
  const createDebt = useCreateDebt();
  const user = useUserStore((state) => state.user);

  return (
    <ScreenContainer>
      <Text variant="headlineMedium">New debt</Text>
      <Text variant="bodyMedium">
        Record money you gave or money you took in one place.
      </Text>
      <DebtForm
        submitLabel="Save debt"
        isSubmitting={createDebt.isPending}
        onSubmit={async (payload) => {
          try {
            await createDebt.mutateAsync({
              ...payload,
              currencyCode: user?.currencyCode ?? "INR"
            });
            router.replace("/(tabs)/debts" as Href);
          } catch (error) {
            Alert.alert(
              "Unable to save debt",
              error instanceof Error ? error.message : "Something went wrong."
            );
          }
        }}
      />
    </ScreenContainer>
  );
}
