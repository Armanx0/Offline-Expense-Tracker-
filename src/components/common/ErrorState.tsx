import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export const ErrorState = ({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <View style={styles.container}>
    <Text variant="bodyMedium">{message}</Text>
    {onRetry ? (
      <Button mode="contained-tonal" onPress={onRetry}>
        Try Again
      </Button>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 20
  }
});
