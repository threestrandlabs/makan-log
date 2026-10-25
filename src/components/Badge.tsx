import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { Text } from "./Text";

export function VariesBadge() {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.highlightSoft }]}>
      <Text variant="caption" style={{ color: colors.onHighlight, fontWeight: "700" as const }}>
        Varies a lot
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: space8[2],
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
});
