import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { DebtSummary } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";

export const DebtSummaryCards = ({ summary }: { summary: DebtSummary }) => (
  <View style={styles.row}>
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="labelLarge">To collect</Text>
        <Text variant="headlineSmall">
          {formatCurrency(summary.collectAmountMinor, summary.currencyCode)}
        </Text>
        <Text variant="bodySmall">{summary.openGivenCount} open</Text>
      </Card.Content>
    </Card>
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="labelLarge">To pay</Text>
        <Text variant="headlineSmall">
          {formatCurrency(summary.payAmountMinor, summary.currencyCode)}
        </Text>
        <Text variant="bodySmall">{summary.openTakenCount} open</Text>
      </Card.Content>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12
  },
  card: {
    borderRadius: 22,
    flex: 1
  },
  content: {
    gap: 6
  }
});
