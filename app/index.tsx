import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { RangeCard } from "@/components/RangeCard";
import { VariesBadge } from "@/components/Badge";
import { useTheme } from "@/theme/ThemeProvider";
import { space8, radii } from "@/theme/theme";
import { getTodayMeals, removeMeal, type SavedMeal } from "@/data/savedMeals";

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(): string {
  return new Date().toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "short" });
}

export default function TodayScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    getTodayMeals().then((m) => {
      setMeals(m);
      setLoaded(true);
    });
  }, []);

  useFocusEffect(refresh);

  const withEstimate = meals.filter((m) => m.hasEstimate);
  const lo = withEstimate.reduce((sum, m) => sum + m.lo, 0);
  const hi = withEstimate.reduce((sum, m) => sum + m.hi, 0);
  const noEstimateCount = meals.length - withEstimate.length;
  const variesALot = withEstimate.some((m) => m.variesALot);

  const onRemove = (id: string) => {
    removeMeal(id).then(refresh);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text variant="caption" color="muted">
            {dateLabel()}
          </Text>
          <Text variant="title">Today</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${scheme === "dark" ? "light" : "dark"} mode`}
          onPress={toggleScheme}
          style={[styles.themeBtn, { borderColor: colors.border }]}
        >
          <Text variant="label">{scheme === "dark" ? "☀︎" : "☾"}</Text>
        </Pressable>
      </View>

      {loaded && meals.length > 0 ? (
        <RangeCard
          eyebrow="So far today"
          estimate={{ hasEstimate: withEstimate.length > 0, lo, hi, variesALot }}
          footnote={
            noEstimateCount > 0
              ? `${meals.length} meal${meals.length > 1 ? "s" : ""} logged · ${noEstimateCount} without an estimate`
              : `${meals.length} meal${meals.length > 1 ? "s" : ""} logged · estimates vary by stall and portion`
          }
        />
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="bodyStrong">Nothing logged yet today.</Text>
          <Text variant="body" color="muted" style={{ marginTop: 4 }}>
            Snap your next meal and it will show up here.
          </Text>
        </View>
      )}

      <View style={{ marginTop: space8[5] }}>
        <Button
          label="Snap your meal"
          subLabel="Photo, bag, or pick a sample"
          variant="cta"
          fullWidth
          onPress={() => router.push("/camera")}
        />
      </View>

      {meals.length > 0 && (
        <View style={{ marginTop: space8[6] }}>
          <Text variant="heading" style={{ marginBottom: space8[2] }}>
            Today&apos;s meals
          </Text>
          {meals.map((m) => (
            <Pressable
              key={m.id}
              onLongPress={() => onRemove(m.id)}
              style={[styles.mealRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="caption" color="muted">
                  {timeLabel(m.savedAt)}
                </Text>
                <Text variant="bodyStrong">{m.dishName}</Text>
                {m.modifierLabels.length > 0 ? (
                  <Text variant="caption" color="muted">
                    {m.modifierLabels.join(" · ")}
                  </Text>
                ) : null}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text variant="label" color="primary">
                  {m.hasEstimate ? `${m.lo.toLocaleString("en-SG")}–${m.hi.toLocaleString("en-SG")}` : "—"}
                </Text>
                <Text variant="caption" color="muted">
                  {m.hasEstimate ? "kcal est." : "no estimate"}
                </Text>
                {m.variesALot ? (
                  <View style={{ marginTop: 4 }}>
                    <VariesBadge />
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
          <Text variant="caption" color="muted" style={{ marginTop: space8[2] }}>
            Tip: press and hold a meal to remove it.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text variant="caption" color="muted">
          Estimates for general information only. Not medical advice.{" "}
          <Link href="/about">
            <Text variant="caption" color="primary">
              About these estimates
            </Text>
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space8[4],
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: space8[5],
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[3],
    marginBottom: space8[2],
    gap: space8[2],
  },
  footer: { marginTop: space8[8] },
});
