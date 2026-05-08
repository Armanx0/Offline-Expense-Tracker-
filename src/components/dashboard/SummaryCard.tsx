import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { DashboardOverview } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";

export const SummaryCard = ({
  summary
}: {
  summary: DashboardOverview["summary"];
}) => (
  <Card style={styles.card}>
    <Card.Content style={styles.content}>
      <View>
        <Text variant="labelLarge">Total spent</Text>
        <Text variant="headlineMedium">
          {formatCurrency(summary.totalAmountMinor, summary.currencyCode)}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View>
          <Text variant="labelMedium">Transactions</Text>
          <Text variant="titleMedium">{summary.transactionCount}</Text>
        </View>
        <View>
          <Text variant="labelMedium">Average</Text>
          <Text variant="titleMedium">
            {formatCurrency(summary.averageAmountMinor, summary.currencyCode)}
          </Text>
        </View>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24
  },
  content: {
    gap: 16
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
