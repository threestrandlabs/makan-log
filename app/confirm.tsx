import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { RangeCard } from "@/components/RangeCard";
import { TopBar } from "@/components/TopBar";
import { space8 } from "@/theme/theme";
import { nutritionSource } from "@/data/nutritionSource";
import { modifierDeltaLabel } from "@/data/calc";
import { addMeal } from "@/data/savedMeals";
import { DEFAULT_DISH_ID } from "@/data/defaults";

export default function ConfirmScreen() {
  const params = useLocalSearchParams<{ dish?: string; sample?: string; upload?: string }>();
  const dishId = (Array.isArray(params.dish) ? params.dish[0] : params.dish) ?? DEFAULT_DISH_ID;
  const dish = nutritionSource.getDish(dishId) ?? nutritionSource.getDish(DEFAULT_DISH_ID)!;

  const allModifiers = nutritionSource.getModifiers(dish.id);
  const riceModifierIds = new Set(dish.riceModifierIds ?? []);
  const riceModifiers = allModifiers.filter((m) => riceModifierIds.has(m.id));
  const otherModifiers = allModifiers.filter((m) => !riceModifierIds.has(m.id));

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const estimate = useMemo(() => nutritionSource.applyModifiers(dish.id, selected), [dish.id, selected]);

  const toggleRice = (id: string) => {
    setSelected((prev) => {
      const withoutRiceGroup = prev.filter((x) => !riceModifierIds.has(x));
      return prev.includes(id) ? withoutRiceGroup : [...withoutRiceGroup, id];
    });
  };

  const toggleOther = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedLabels = allModifiers.filter((m) => selected.includes(m.id)).map((m) => m.label);

  const onSave = async () => {
    setSaving(true);
    try {
      const meal = await addMeal({
        dishId: dish.id,
        dishName: dish.name,
        modifierLabels: selectedLabels,
        hasEstimate: estimate.hasEstimate,
        lo: estimate.lo,
        hi: estimate.hi,
        variesALot: estimate.variesALot,
      });
      router.replace(`/saved?mealId=${meal.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Check your plate" fallbackRoute="/results" />

      <Text variant="title">{dish.name}</Text>
      <Text variant="body" color="muted" style={{ marginTop: 4 }}>
        {dish.portionLabel}
      </Text>

      <View style={{ marginTop: space8[4] }}>
        <RangeCard
          eyebrow="Your plate roughly"
          estimate={estimate}
          footnote={
            estimate.hasEstimate
              ? "A typical plate. The range updates as you tweak it."
              : "We don't have calorie data for this dish yet. You can still log it."
          }
        />
      </View>

      {allModifiers.length > 0 && (
        <View style={{ marginTop: space8[5] }}>
          <Text variant="heading" style={{ marginBottom: space8[1] }}>
            Tweak your plate
          </Text>
          <Text variant="caption" color="muted" style={{ marginBottom: space8[3] }}>
            Tell us what&apos;s different and the range updates.
          </Text>
          <View style={styles.chipWrap}>
            {riceModifiers.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                subLabel={modifierDeltaLabel(m)}
                selected={selected.includes(m.id)}
                onPress={() => toggleRice(m.id)}
              />
            ))}
            {otherModifiers.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                subLabel={modifierDeltaLabel(m)}
                selected={selected.includes(m.id)}
                onPress={() => toggleOther(m.id)}
              />
            ))}
          </View>
        </View>
      )}

      <Text variant="caption" color="muted" style={{ marginTop: space8[5] }}>
        Estimates are Three Strand Labs&apos; own figures, adapted from HPB&apos;s SG FoodID and other
        published data. Your plate may differ.
      </Text>

      <View style={{ marginTop: space8[6] }}>
        <Button label="Save to Today" variant="cta" fullWidth loading={saving} onPress={onSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: space8[2] },
});
