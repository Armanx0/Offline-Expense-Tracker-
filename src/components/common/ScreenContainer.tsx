import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ScreenContainer = ({ children }: PropsWithChildren) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.keyboardContainer,
        { backgroundColor: theme.colors.background }
      ]}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 20) + 12,
            paddingBottom: Math.max(insets.bottom, 24) + 24
          }
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={[
          styles.scrollView,
          { backgroundColor: theme.colors.background }
        ]}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20
  },
  inner: {
    gap: 16
  }
});
