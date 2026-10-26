import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { Text } from "./Text";

export function Toast({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.toast, { backgroundColor: colors.text }]}>
        <Text variant="bodyStrong" style={{ color: colors.bg }}>
          ✓ {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space8[5],
    paddingBottom: space8[5],
  },
  toast: {
    borderRadius: radii.lg,
    paddingVertical: space8[3],
    paddingHorizontal: space8[4],
    alignItems: "center",
  },
});
