import { useCallback, useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { Text } from "./Text";
import { RangeCard } from "./RangeCard";
import { VariesBadge } from "./Badge";
import { useTheme } from "@/theme/ThemeProvider";
import { palette, radii, space8 } from "@/theme/theme";
import { getTodayMeals, removeMeal, type SavedMeal } from "@/data/savedMeals";
import { SLOT_LABEL, nextUnloggedCoreSlot, todaySubtitle } from "@/data/mealSlot";

const markLight = require("../../assets/images/plate-light-192.png");
const markDark = require("../../assets/images/plate-dark-192.png");

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(): string {
  return new Date().toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" });
}

type Props = { highlightMealId?: string };

export function TodayContent({ highlightMealId }: Props) {
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
  const loggedSlots = new Set(meals.map((m) => m.slot));
  const nextSlot = nextUnloggedCoreSlot(loggedSlots, new Date());

  const onRemove = (id: string) => removeMeal(id).then(refresh);

  return (
    <View>
      <View style={styles.brandRow}>
        <Image source={scheme === "dark" ? markDark : markLight} style={styles.mark} contentFit="contain" />
        <Text variant="bodyStrong" color="primary" style={{ flex: 1 }}>
          Makan Log
        </Text>
        <Text variant="caption" color="muted">
          {dateLabel()}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${scheme === "dark" ? "light" : "dark"} mode`}
          onPress={toggleScheme}
          style={[styles.themeBtn, { borderColor: colors.border }]}
        >
          <Text variant="label">{scheme === "dark" ? "☀︎" : "☾"}</Text>
        </Pressable>
      </View>

      <Text variant="title" style={{ marginTop: space8[3] }}>
        Today
      </Text>
      <Text variant="body" color="muted" style={{ marginTop: 2, marginBottom: space8[4] }}>
        {loaded ? todaySubtitle(meals.length, loggedSlots, new Date()) : " "}
      </Text>

      {loaded && meals.length > 0 ? (
        <RangeCard
          eyebrow="So far today"
          estimate={{ hasEstimate: withEstimate.length > 0, lo, hi, variesALot }}
          footnote={
            noEstimateCount > 0
              ? `A range, not an exact count. Hawker portions vary. · ${noEstimateCount} meal${noEstimateCount > 1 ? "s" : ""} without an estimate`
              : "A range, not an exact count. Hawker portions vary."
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

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/camera")}
        style={[styles.snapBtn, { backgroundColor: colors.cta }]}
      >
        <View style={[styles.snapIcon, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
          <Text variant="heading" color="onCta">
            📷
          </Text>
        </View>
        <View>
          <Text variant="bodyStrong" color="onCta">
            Snap your meal
          </Text>
          <Text variant="caption" color="onCta" style={{ opacity: 0.9 }}>
            Photo first, tweak after
          </Text>
        </View>
      </Pressable>

      {meals.length > 0 && (
        <View style={{ marginTop: space8[6] }}>
          <Text variant="heading" style={{ marginBottom: space8[2] }}>
            Today&apos;s meals
          </Text>
          {meals.map((m) => {
            const isNew = m.id === highlightMealId;
            return (
              <Pressable
                key={m.id}
                onLongPress={() => onRemove(m.id)}
                style={[
                  styles.mealRow,
                  { backgroundColor: colors.surface, borderColor: isNew ? colors.primary : colors.border },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: palette.kaya }]}>
                  <Text variant="label">{m.dishId === "cai_png" ? "◎" : "◉"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="caption" color="muted">
                    {SLOT_LABEL[m.slot]} · {timeLabel(m.savedAt)}
                  </Text>
                  <Text variant="bodyStrong">{m.dishName}</Text>
                  <Text variant="label" color={m.hasEstimate ? "primary" : "muted"}>
                    {m.hasEstimate
                      ? `${m.lo.toLocaleString("en-SG")}–${m.hi.toLocaleString("en-SG")} kcal estimate`
                      : "No estimate yet"}
                  </Text>
                  {m.variesALot ? (
                    <View style={{ marginTop: 4, alignSelf: "flex-start" }}>
                      <VariesBadge />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}

          {nextSlot ? (
            <Pressable
              onPress={() => router.push("/camera")}
              style={[styles.dashedRow, { borderColor: colors.border }]}
            >
              <Text variant="bodyStrong" color="primary">
                + {SLOT_LABEL[nextSlot]}? Snap it when it&apos;s served
              </Text>
            </Pressable>
          ) : null}

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
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: space8[2] },
  mark: { width: 24, height: 24 },
  themeBtn: {
    width: 36,
    height: 36,
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
  snapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: space8[3],
    borderRadius: radii.lg,
    padding: space8[4],
    marginTop: space8[4],
  },
  snapIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[3],
    marginBottom: space8[2],
    gap: space8[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  dashedRow: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.pill,
    paddingVertical: space8[3],
    alignItems: "center",
    marginTop: space8[1],
  },
  footer: { marginTop: space8[8] },
});
