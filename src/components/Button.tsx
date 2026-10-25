import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, sizes, space8 } from "@/theme/theme";
import { Text } from "./Text";

type Variant = "primary" | "cta" | "ghost" | "outline";

type Props = {
  label: string;
  subLabel?: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  label,
  subLabel,
  onPress,
  variant = "primary",
  disabled,
  loading,
  fullWidth,
  icon,
}: Props) {
  const { colors } = useTheme();

  const bg =
    variant === "primary" ? colors.primary : variant === "cta" ? colors.cta : variant === "outline" ? "transparent" : "transparent";
  const border = variant === "outline" ? colors.border : variant === "ghost" ? "transparent" : "transparent";
  const textColor = variant === "primary" ? colors.onPrimary : variant === "cta" ? colors.onCta : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === "outline" ? 1 : 0 },
        pressed && !disabled && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <View style={styles.row}>
        {icon}
        <View>
          <Text variant="bodyStrong" style={{ color: textColor, textAlign: "center" }}>
            {loading ? " " : label}
          </Text>
          {subLabel ? (
            <Text variant="caption" style={{ color: textColor, opacity: 0.85, textAlign: "center" }}>
              {subLabel}
            </Text>
          ) : null}
        </View>
      </View>
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={textColor} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touchMin,
    borderRadius: radii.lg,
    paddingHorizontal: space8[5],
    paddingVertical: space8[3],
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { width: "100%" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space8[2] },
  loadingOverlay: { flex: 1, alignItems: "center", justifyContent: "center" },
});
