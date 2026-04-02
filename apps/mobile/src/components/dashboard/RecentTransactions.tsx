import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { ExpenseDto } from "@expense-tracker/contracts";

import { formatCurrency } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";

export const RecentTransactions = ({
  expenses
}: {
  expenses: ExpenseDto[];
}) => (
  <Card style={styles.card}>
    <Card.Content style={styles.content}>
      <Text variant="titleMedium">Recent transactions</Text>
      {expenses.length === 0 ? (
        <Text variant="bodyMedium">No expenses recorded yet.</Text>
      ) : (
        expenses.map((expense) => (
          <View key={expense.id} style={styles.row}>
            <View>
              <Text variant="titleSmall">{expense.category.name}</Text>
              <Text variant="bodySmall">
                {expense.description ?? formatDisplayDate(expense.occurredAt)}
              </Text>
            </View>
            <Text variant="titleSmall">
              {formatCurrency(expense.amountMinor, expense.currencyCode)}
            </Text>
          </View>
        ))
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24
  },
  content: {
    gap: 12
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
