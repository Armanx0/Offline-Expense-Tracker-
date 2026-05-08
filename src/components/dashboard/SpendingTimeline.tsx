import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import type { DashboardOverview } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";

export const SpendingTimeline = ({
  timeline,
  currencyCode
}: {
  timeline: DashboardOverview["timeline"];
  currencyCode: string;
}) => {
  const theme = useTheme();
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
              <Text
                variant="bodySmall"
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                {point.label}
              </Text>
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: theme.colors.surfaceVariant }
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${Math.max((point.amountMinor / maxAmount) * 100, 6)}%`
                    }
                  ]}
                />
              </View>
              <Text
                variant="bodySmall"
                style={[styles.value, { color: theme.colors.onSurfaceVariant }]}
              >
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
    borderRadius: 999,
    flex: 1,
    height: 10,
    overflow: "hidden"
  },
  barFill: {
    borderRadius: 999,
    height: "100%"
  },
  value: {
    textAlign: "right",
    width: 92
  }
});
