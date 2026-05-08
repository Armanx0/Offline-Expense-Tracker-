import { endOfDay } from "date-fns";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { DebtDto } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";

const getDueLabel = (debt: DebtDto) => {
  if (!debt.dueDate) {
    return "No due date";
  }

  if (
    debt.status === "open" &&
    endOfDay(new Date(debt.dueDate)).getTime() < Date.now()
  ) {
    return `Overdue · ${formatDisplayDate(debt.dueDate)}`;
  }

  return `Due ${formatDisplayDate(debt.dueDate)}`;
};

export const DebtListItem = ({
  debt,
  onPress
}: {
  debt: DebtDto;
  onPress: () => void;
}) => {
  const theme = useTheme();
  const isOverdue =
    debt.status === "open" &&
    debt.dueDate !== null &&
    endOfDay(new Date(debt.dueDate)).getTime() < Date.now();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isOverdue
            ? theme.colors.error
            : theme.colors.outlineVariant
        }
      ]}
    >
      <View style={styles.leading}>
        <Text numberOfLines={1} variant="titleSmall" style={styles.personName}>
          {debt.personName}
        </Text>
        <Text
          numberOfLines={1}
          variant="bodySmall"
          style={{
            color: isOverdue
              ? theme.colors.error
              : theme.colors.onSurfaceVariant
          }}
        >
          {getDueLabel(debt)}
        </Text>
        {debt.note ? (
          <Text
            numberOfLines={1}
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {debt.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>
        <Text variant="titleSmall" style={styles.amount}>
          {formatCurrency(debt.outstandingAmountMinor, debt.currencyCode)}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {debt.status === "settled" && debt.settledAt
            ? `Settled ${formatDisplayDate(debt.settledAt)}`
            : debt.direction === "given"
              ? "To collect"
              : "To pay"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  leading: {
    flex: 1,
    gap: 3,
    minWidth: 0
  },
  personName: {
    fontWeight: "700"
  },
  trailing: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
    minWidth: 100
  },
  amount: {
    fontWeight: "700",
    textAlign: "right"
  }
});
