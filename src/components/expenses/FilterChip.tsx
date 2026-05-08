import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  leading?: string;
}

export const FilterChip = ({
  label,
  selected,
  onPress,
  leading
}: FilterChipProps) => {
  const theme = useTheme();
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [progress, selected]);

  const idleBackground = theme.dark
    ? theme.colors.surfaceVariant
    : theme.colors.surface;
  const selectedBackground = theme.colors.secondaryContainer;
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [idleBackground, selectedBackground]
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.outlineVariant, theme.colors.secondary]
  });
  const tickOpacity = progress;
  const tickTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0]
  });
  const contentColor = selected
    ? theme.colors.onSecondaryContainer
    : theme.colors.onSurfaceVariant;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Animated.View style={[styles.chip, { backgroundColor, borderColor }]}>
        <View style={styles.content}>
          {leading ? (
            <Text style={[styles.leading, { color: contentColor }]}>
              {leading}
            </Text>
          ) : null}
          <Text
            variant="labelLarge"
            style={[styles.label, { color: contentColor }]}
          >
            {label}
          </Text>
          <Animated.Text
            style={[
              styles.tick,
              {
                color: theme.colors.onSecondaryContainer,
                opacity: tickOpacity,
                transform: [{ translateX: tickTranslateX }]
              }
            ]}
          >
            {"\u2713"}
          </Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  leading: {
    fontSize: 13
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 16
  },
  tick: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 8,
    textAlign: "right"
  }
});
