import { ActivityIndicator, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
    <Text variant="bodyMedium">{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    paddingVertical: 32
  }
});
