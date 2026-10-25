import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { Text } from "./Text";

type Props = {
  label: string;
  subLabel?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, subLabel, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text variant="label" style={{ color: selected ? colors.primary : colors.text }}>
        {selected ? "✓ " : "+ "}
        {label}
      </Text>
      {subLabel ? (
        <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
          {subLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space8[4],
    paddingVertical: space8[2],
  },
});
