import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { ExpenseDto } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";

export const ExpenseListItem = ({
  expense,
  onPress
}: {
  expense: ExpenseDto;
  onPress: () => void;
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant
        }
      ]}
    >
      <View style={styles.leading}>
        <Text variant="titleLarge">{expense.category.icon ?? "*"}</Text>
        <View style={styles.textBlock}>
          <Text numberOfLines={1} variant="bodyMedium" style={styles.category}>
            {expense.category.name}
          </Text>
          <Text
            numberOfLines={1}
            variant="bodySmall"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {expense.description ?? formatDisplayDate(expense.occurredAt)}
          </Text>
        </View>
      </View>
      <View style={styles.trailing}>
        <Text numberOfLines={1} variant="labelLarge" style={styles.amount}>
          {formatCurrency(expense.amountMinor, expense.currencyCode)}
        </Text>
        <Text
          numberOfLines={1}
          variant="bodySmall"
          style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
        >
          {formatDisplayDate(expense.occurredAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  leading: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 10,
    minWidth: 0
  },
  textBlock: {
    flex: 1,
    minWidth: 0
  },
  category: {
    fontWeight: "600"
  },
  description: {
    marginTop: 1
  },
  trailing: {
    alignItems: "flex-end",
    gap: 2,
    marginLeft: 12,
    minWidth: 88
  },
  amount: {
    fontWeight: "700"
  },
  date: {
    textAlign: "right"
  }
});
