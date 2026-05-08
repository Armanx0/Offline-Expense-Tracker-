import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { DashboardOverview } from "../../contracts";

import { formatCurrency } from "../../utils/currency.util";

export const TopCategoryList = ({
  categories,
  currencyCode
}: {
  categories: DashboardOverview["topCategories"];
  currencyCode: string;
}) => (
  <Card style={styles.card}>
    <Card.Content style={styles.content}>
      <Text variant="titleMedium">Top categories</Text>
      {categories.length === 0 ? (
        <Text variant="bodyMedium">No expenses yet for this period.</Text>
      ) : (
        categories.map((item) => (
          <View key={item.category.id} style={styles.row}>
            <View style={styles.titleRow}>
              <Text variant="bodyLarge">{item.category.icon ?? "*"}</Text>
              <View>
                <Text variant="titleSmall">{item.category.name}</Text>
                <Text variant="bodySmall">{item.count} transactions</Text>
              </View>
            </View>
            <View style={styles.valueBlock}>
              <Text variant="titleSmall">
                {formatCurrency(item.amountMinor, currencyCode)}
              </Text>
              <Text variant="bodySmall">{item.percentage}%</Text>
            </View>
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
    gap: 14
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  valueBlock: {
    alignItems: "flex-end"
  }
});
