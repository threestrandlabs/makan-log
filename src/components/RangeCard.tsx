import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { palette, radii, space8 } from "@/theme/theme";
import { Text } from "./Text";
import { VariesBadge } from "./Badge";
import type { RangeEstimate } from "@/data/types";

type Props = {
  eyebrow: string;
  estimate: RangeEstimate;
  footnote?: string;
};

export function RangeCard({ eyebrow, estimate, footnote }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.primary, borderColor: palette.pandanLight }]}>
      <View style={styles.row}>
        <Text variant="label" color="onPrimary" style={{ opacity: 0.85 }}>
          {eyebrow}
        </Text>
        {estimate.hasEstimate && estimate.variesALot ? <VariesBadge /> : null}
      </View>
      {estimate.hasEstimate ? (
        <Text variant="display" color="onPrimary" style={styles.rangeText}>
          {estimate.lo.toLocaleString("en-SG")}–{estimate.hi.toLocaleString("en-SG")}
          <Text variant="label" color="onPrimary"> kcal estimate</Text>
        </Text>
      ) : (
        <Text variant="title" color="onPrimary" style={styles.rangeText}>
          No estimate yet
        </Text>
      )}
      {footnote ? (
        <Text variant="caption" color="onPrimary" style={{ opacity: 0.85, marginTop: space8[2] }}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: space8[5],
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rangeText: { marginTop: space8[2] },
});
