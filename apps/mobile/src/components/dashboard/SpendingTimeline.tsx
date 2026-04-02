import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { DashboardOverview } from "@expense-tracker/contracts";

import { formatCurrency } from "../../utils/currency.util";

export const SpendingTimeline = ({
  timeline,
  currencyCode
}: {
  timeline: DashboardOverview["timeline"];
  currencyCode: string;
}) => {
  const maxAmount = Math.max(...timeline.map((point) => point.amountMinor), 1);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium">Timeline</Text>
        {timeline.length === 0 ? (
          <Text variant="bodyMedium">No timeline data yet.</Text>
        ) : (
          timeline.map((point) => (
            <View key={point.date} style={styles.row}>
              <Text variant="bodySmall" style={styles.label}>
                {point.label}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max((point.amountMinor / maxAmount) * 100, 6)}%`
                    }
                  ]}
                />
              </View>
              <Text variant="bodySmall" style={styles.value}>
                {formatCurrency(point.amountMinor, currencyCode)}
              </Text>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );
};

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
    gap: 12
  },
  label: {
    width: 48
  },
  barTrack: {
    backgroundColor: "#E7E1D7",
    borderRadius: 999,
    flex: 1,
    height: 10,
    overflow: "hidden"
  },
  barFill: {
    backgroundColor: "#1D4ED8",
    borderRadius: 999,
    height: "100%"
  },
  value: {
    width: 92,
    textAlign: "right"
  }
});
