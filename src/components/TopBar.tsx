import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { space8 } from "@/theme/theme";
import { Text } from "./Text";

type Props = {
  title: string;
  onBack?: () => void;
  fallbackRoute?: string;
  right?: React.ReactNode;
};

export function TopBar({ title, onBack, fallbackRoute = "/", right }: Props) {
  const { colors } = useTheme();
  const handleBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace(fallbackRoute as any)));
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={handleBack} hitSlop={12} style={styles.backBtn}>
        <Text variant="bodyStrong" style={{ color: colors.primary }}>
          ‹ Back
        </Text>
      </Pressable>
      <Text variant="heading" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: space8[4] },
  backBtn: { minWidth: 64 },
  title: { flex: 1, textAlign: "center" },
  right: { minWidth: 64, alignItems: "flex-end" },
});
