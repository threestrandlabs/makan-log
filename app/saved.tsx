import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { RangeCard } from "@/components/RangeCard";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { getTodayMeals, type SavedMeal } from "@/data/savedMeals";

export default function SavedScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ mealId?: string }>();
  const [meal, setMeal] = useState<SavedMeal | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTodayMeals().then((meals) => {
      const found = meals.find((m) => m.id === params.mealId) ?? meals[0] ?? null;
      setMeal(found);
      setLoaded(true);
    });
  }, [params.mealId]);

  if (!loaded) return <Screen><View /></Screen>;

  return (
    <Screen>
      <View style={[styles.banner, { backgroundColor: colors.text }]}>
        <Text variant="bodyStrong" color="onPrimary">
          ✓ Saved to Today
        </Text>
      </View>

      {meal ? (
        <View style={{ marginTop: space8[4] }}>
          <Text variant="title">{meal.dishName}</Text>
          {meal.modifierLabels.length > 0 ? (
            <Text variant="body" color="muted" style={{ marginTop: 4 }}>
              {meal.modifierLabels.join(" · ")}
            </Text>
          ) : null}
          <View style={{ marginTop: space8[4] }}>
            <RangeCard
              eyebrow="Logged just now"
              estimate={{ hasEstimate: meal.hasEstimate, lo: meal.lo, hi: meal.hi, variesALot: meal.variesALot }}
            />
          </View>
        </View>
      ) : (
        <Text variant="body" color="muted" style={{ marginTop: space8[4] }}>
          Your meal has been added to today&apos;s log.
        </Text>
      )}

      <View style={{ marginTop: space8[8], gap: space8[2] }}>
        <Button label="Back to Today" variant="primary" fullWidth onPress={() => router.replace("/")} />
        <Button label="Snap another meal" variant="outline" fullWidth onPress={() => router.replace("/camera")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radii.lg,
    paddingVertical: space8[3],
    paddingHorizontal: space8[4],
    alignItems: "center",
  },
});
