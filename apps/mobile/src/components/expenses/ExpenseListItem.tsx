import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import type { ExpenseDto } from "@expense-tracker/contracts";

import { formatCurrency } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";

export const ExpenseListItem = ({
  expense,
  onPress
}: {
  expense: ExpenseDto;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.leading}>
      <Text variant="headlineSmall">{expense.category.icon ?? "*"}</Text>
      <View>
        <Text variant="titleSmall">{expense.category.name}</Text>
        <Text variant="bodySmall">
          {expense.description ?? formatDisplayDate(expense.occurredAt)}
        </Text>
      </View>
    </View>
    <View style={styles.trailing}>
      <Text variant="titleSmall">
        {formatCurrency(expense.amountMinor, expense.currencyCode)}
      </Text>
      <Text variant="bodySmall">{formatDisplayDate(expense.occurredAt)}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  },
  leading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  trailing: {
    alignItems: "flex-end"
  }
});
