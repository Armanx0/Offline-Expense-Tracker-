import { router, type Href, useLocalSearchParams } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { DebtBalanceActionForm } from "../../src/components/debts/DebtBalanceActionForm";
import { DebtMetadataForm } from "../../src/components/debts/DebtMetadataForm";
import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import {
  useAddDebtAmount,
  useDebt,
  useDeleteDebt,
  useRecordDebtPayment,
  useUpdateDebtMetadata
} from "../../src/hooks/useDebts";
import { formatCurrency } from "../../src/utils/currency.util";
import { formatDisplayDate } from "../../src/utils/date.util";

const getDirectionCopy = (direction: "given" | "taken") =>
  direction === "given"
    ? {
        title: "Money given",
        subtitle: "Track what this person still owes you.",
        paymentLabel: "Record collection",
        addLabel: "Add more given"
      }
    : {
        title: "Money taken",
        subtitle: "Track what you still need to pay back.",
        paymentLabel: "Record repayment",
        addLabel: "Add more taken"
      };

const getEntryLabel = (
  direction: "given" | "taken",
  type: "initial" | "increment" | "payment"
) => {
  if (type === "initial") {
    return direction === "given" ? "Initial given" : "Initial taken";
  }

  if (type === "increment") {
    return direction === "given" ? "Added more given" : "Added more taken";
  }

  return direction === "given" ? "Collected back" : "Paid back";
};

export default function DebtDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const debtDashboardRoute = "/(tabs)/debts" as Href;
  const debt = useDebt(id ?? "");
  const updateDebtMetadata = useUpdateDebtMetadata();
  const addDebtAmount = useAddDebtAmount();
  const recordDebtPayment = useRecordDebtPayment();
  const deleteDebt = useDeleteDebt();

  if (!id) {
    return <ErrorState message="Debt not found" />;
  }

  if (debt.isLoading) {
    return <LoadingState label="Loading debt..." />;
  }

  if (debt.error || !debt.data) {
    return <ErrorState message={debt.error?.message ?? "Debt not found"} />;
  }

  const copy = getDirectionCopy(debt.data.direction);
  const isOpen = debt.data.status === "open";

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineMedium">{copy.title}</Text>
        <Text variant="bodyMedium">{copy.subtitle}</Text>
      </View>

      <Card>
        <Card.Content style={styles.summaryContent}>
          <Text variant="labelLarge">{debt.data.personName}</Text>
          <Text variant="headlineSmall">
            {formatCurrency(
              debt.data.outstandingAmountMinor,
              debt.data.currencyCode
            )}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {isOpen ? "Open" : "Settled"}
            {debt.data.dueDate
              ? ` · Due ${formatDisplayDate(debt.data.dueDate)}`
              : ""}
            {!isOpen && debt.data.settledAt
              ? ` · Closed ${formatDisplayDate(debt.data.settledAt)}`
              : ""}
          </Text>
        </Card.Content>
      </Card>

      <DebtMetadataForm
        initialValues={{
          personName: debt.data.personName,
          dueDate: debt.data.dueDate ? new Date(debt.data.dueDate) : null,
          note: debt.data.note ?? ""
        }}
        submitLabel="Update details"
        isSubmitting={updateDebtMetadata.isPending}
        onSubmit={async (payload) => {
          try {
            await updateDebtMetadata.mutateAsync({ id, payload });
            router.replace(debtDashboardRoute);
          } catch (error) {
            Alert.alert(
              "Unable to update debt",
              error instanceof Error ? error.message : "Something went wrong."
            );
          }
        }}
      />

      {isOpen ? (
        <DebtBalanceActionForm
          title={copy.addLabel}
          submitLabel="Save amount"
          isSubmitting={addDebtAmount.isPending}
          onSubmit={async (payload) => {
            try {
              await addDebtAmount.mutateAsync({ id, payload });
              router.replace(debtDashboardRoute);
            } catch (error) {
              Alert.alert(
                "Unable to add amount",
                error instanceof Error ? error.message : "Something went wrong."
              );
            }
          }}
        />
      ) : null}

      {isOpen ? (
        <DebtBalanceActionForm
          title={copy.paymentLabel}
          submitLabel="Save payment"
          isSubmitting={recordDebtPayment.isPending}
          onSubmit={async (payload) => {
            try {
              await recordDebtPayment.mutateAsync({ id, payload });
              router.replace(debtDashboardRoute);
            } catch (error) {
              Alert.alert(
                "Unable to record payment",
                error instanceof Error ? error.message : "Something went wrong."
              );
            }
          }}
        />
      ) : null}

      <View style={styles.historyBlock}>
        <Text variant="titleMedium">Activity</Text>
        {debt.data.entries.map((entry) => (
          <Card key={entry.id}>
            <Card.Content style={styles.entryContent}>
              <View>
                <Text variant="titleSmall">
                  {getEntryLabel(debt.data.direction, entry.type)}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {formatDisplayDate(entry.occurredAt)}
                </Text>
              </View>
              <Text variant="titleSmall">
                {formatCurrency(entry.amountMinor, debt.data.currencyCode)}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button
        mode="outlined"
        textColor={theme.colors.error}
        onPress={() => {
          Alert.alert("Delete debt", `Delete ${debt.data.personName}?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                void deleteDebt
                  .mutateAsync(id)
                  .then(() => router.replace(debtDashboardRoute))
                  .catch((error: Error) => {
                    Alert.alert("Unable to delete debt", error.message);
                  });
              }
            }
          ]);
        }}
      >
        Delete debt
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6
  },
  summaryContent: {
    gap: 6
  },
  historyBlock: {
    gap: 10
  },
  entryContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
