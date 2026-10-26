import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { RangeCard } from "@/components/RangeCard";
import { TopBar } from "@/components/TopBar";
import { PlateIcon } from "@/components/PlateIcon";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { nutritionSource } from "@/data/nutritionSource";
import { modifierDeltaLabel } from "@/data/calc";
import { addMeal } from "@/data/savedMeals";
import { DEFAULT_DISH_ID, DEFAULT_MIXED_SAMPLE_ID } from "@/data/defaults";
import { resolvePhotoParams } from "@/lib/photoFromParams";
import { resolveRecognition } from "@/data/recogniser";
import { findSamplePhoto } from "@/data/samplePhotos";
import { slotForDate, SLOT_LABEL } from "@/data/mealSlot";
import {
  computeMixedPlateRange,
  getMixedPlateSideOptions,
  searchMixedPlateSides,
  RICE_LABEL,
} from "@/data/mixedPlate";
import type { RiceOption } from "@/data/types";

export default function ConfirmScreen() {
  const params = useLocalSearchParams<{ dish?: string; sample?: string; upload?: string; mixed?: string }>();
  const dishId = (Array.isArray(params.dish) ? params.dish[0] : params.dish) ?? "";
  const isMixed = params.mixed === "1" || dishId === "cai_png";

  return isMixed ? <MixedConfirm params={params} /> : <SingleConfirm dishIdParam={dishId} />;
}

/* ---------------- single dish ---------------- */

function SingleConfirm({ dishIdParam }: { dishIdParam: string }) {
  const dish = nutritionSource.getDish(dishIdParam || DEFAULT_DISH_ID) ?? nutritionSource.getDish(DEFAULT_DISH_ID)!;

  const allModifiers = nutritionSource.getModifiers(dish.id);
  const riceModifierIds = new Set(dish.riceModifierIds ?? []);
  const riceModifiers = allModifiers.filter((m) => riceModifierIds.has(m.id));
  const otherModifiers = allModifiers.filter((m) => !riceModifierIds.has(m.id));

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const slot = useMemo(() => slotForDate(new Date()), []);

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

      <View style={styles.dishHeader}>
        <View style={styles.avatar}>
          <PlateIcon size={48} onDarkBackground={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="title">{dish.name}</Text>
          <Text variant="body" color="muted" style={{ marginTop: 2 }}>
            1 plate · logging as {SLOT_LABEL[slot]}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: space8[4] }}>
        <RangeCard
          eyebrow="Your plate, roughly"
          estimate={estimate}
          footnote={
            !estimate.hasEstimate
              ? "We don't have calorie data for this dish yet. You can still log it."
              : selected.length === 0
                ? "A typical plate, no changes yet."
                : "Estimates update as you tweak your plate."
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
        Estimates are based on a typical stall plate. Yours may differ a bit.
      </Text>

      <View style={{ marginTop: space8[6] }}>
        <Button
          label="Save to Today"
          icon={<Text style={{ color: "white" }}>⬇</Text>}
          variant="cta"
          fullWidth
          loading={saving}
          onPress={onSave}
        />
      </View>
    </Screen>
  );
}

/* ---------------- mixed plate (cai png / economy rice) ---------------- */

type MixedSide = { dishId: string; uncertain: boolean };
type PickerTarget = "add" | number | null;

function MixedConfirm({ params }: { params: { sample?: string; upload?: string } }) {
  const { colors } = useTheme();

  const resolvedSampleId = params.sample ?? DEFAULT_MIXED_SAMPLE_ID;
  const photo = resolvePhotoParams({ sample: resolvedSampleId, upload: params.upload });
  const recognition = resolveRecognition(photo.input);
  const mixedDefaults =
    recognition.type === "mixed"
      ? recognition
      : (findSamplePhoto(DEFAULT_MIXED_SAMPLE_ID)!.recognition as Extract<typeof recognition, { type: "mixed" }>);

  const [rice, setRice] = useState<RiceOption>(mixedDefaults.rice);
  const [sides, setSides] = useState<MixedSide[]>(
    mixedDefaults.sides.map((s) => ({ dishId: s.dishId, uncertain: s.uncertain }))
  );
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const slot = useMemo(() => slotForDate(new Date()), []);

  const estimate = useMemo(() => computeMixedPlateRange(sides.map((s) => s.dishId), rice), [sides, rice]);
  const pickerResults = useMemo(
    () => (pickerTarget === null ? [] : searchMixedPlateSides(pickerQuery)),
    [pickerTarget, pickerQuery]
  );

  function itemName(id: string): string {
    const match = getMixedPlateSideOptions().find((i) => i.id === id);
    return match ? match.name : id;
  }

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setPickerQuery("");
  };
  const closePicker = () => setPickerTarget(null);

  const pickItem = (itemId: string) => {
    if (pickerTarget === "add") {
      setSides((prev) => [...prev, { dishId: itemId, uncertain: false }]);
    } else if (typeof pickerTarget === "number") {
      setSides((prev) => prev.map((s, i) => (i === pickerTarget ? { dishId: itemId, uncertain: false } : s)));
    }
    closePicker();
  };

  const removeSide = (index: number) => {
    setSides((prev) => prev.filter((_, i) => i !== index));
  };

  const dishName = `Cai png, ${sides.length} dish${sides.length === 1 ? "" : "es"}`;

  const onSave = async () => {
    setSaving(true);
    try {
      const partLabels = [RICE_LABEL[rice], ...sides.map((s) => itemName(s.dishId))];
      const meal = await addMeal({
        dishId: "cai_png",
        dishName,
        modifierLabels: partLabels,
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

  const riceOptions: RiceOption[] = ["full", "less", "half", "none"];

  return (
    <Screen>
      <TopBar title="Check your plate" fallbackRoute="/results" />

      <View style={styles.dishHeader}>
        <View style={styles.avatar}>
          <PlateIcon size={48} onDarkBackground={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="title">{dishName}</Text>
          <Text variant="body" color="muted" style={{ marginTop: 2 }}>
            Mixed plate · logging as {SLOT_LABEL[slot]}
          </Text>
        </View>
      </View>

      {confirmed ? (
        <View style={{ marginTop: space8[4] }}>
          <RangeCard
            eyebrow="Your plate, roughly"
            estimate={estimate}
            footnote={
              estimate.missingSideIds.length > 0
                ? `${estimate.missingSideIds.length} side${estimate.missingSideIds.length > 1 ? "s" : ""} without calorie data - not counted.`
                : "Sum of your rice and each side. Estimates update as you tweak your plate."
            }
          />
        </View>
      ) : (
        <View style={[styles.pendingCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text variant="bodyStrong">Confirm your dishes to see an estimate</Text>
          <Text variant="body" color="muted" style={{ marginTop: 4 }}>
            Check the rice and each side below, then confirm.
          </Text>
        </View>
      )}

      <View style={{ marginTop: space8[5] }}>
        <Text variant="heading" style={{ marginBottom: space8[2] }}>
          Rice
        </Text>
        <View style={styles.segmented}>
          {riceOptions.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setRice(opt)}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor: rice === opt ? colors.primary : colors.surface,
                  borderColor: rice === opt ? colors.primary : colors.border,
                },
              ]}
            >
              <Text variant="label" style={{ color: rice === opt ? colors.onPrimary : colors.text }}>
                {RICE_LABEL[opt]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: space8[5] }}>
        <View style={styles.spread}>
          <Text variant="heading">Sides</Text>
          <Text variant="caption" color="muted">
            {sides.length} item{sides.length === 1 ? "" : "s"}
          </Text>
        </View>
        {sides.map((side, i) => (
          <View key={`${side.dishId}-${i}`} style={[styles.sideRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Pressable style={{ flex: 1 }} onPress={() => openPicker(i)}>
              <View style={styles.spread}>
                <Text variant="bodyStrong">{itemName(side.dishId)}</Text>
                {side.uncertain ? (
                  <View style={[styles.checkBadge, { backgroundColor: colors.highlightSoft }]}>
                    <Text variant="caption" style={{ color: colors.onHighlight, fontWeight: "700" as const }}>
                      Check this
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="caption" color="primary">
                Tap to fix
              </Text>
            </Pressable>
            <Pressable accessibilityLabel={`Remove ${itemName(side.dishId)}`} onPress={() => removeSide(i)} style={styles.removeBtn}>
              <Text variant="heading" color="muted">
                ×
              </Text>
            </Pressable>
          </View>
        ))}

        <Pressable onPress={() => openPicker("add")} style={[styles.dashedRow, { borderColor: colors.border }]}>
          <Text variant="bodyStrong" color="primary">
            + Add side
          </Text>
        </Pressable>

        {pickerTarget !== null && (
          <View style={[styles.pickerPanel, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.spread}>
              <Text variant="label">{pickerTarget === "add" ? "Add a side" : "Closest matches"}</Text>
              <Pressable onPress={closePicker}>
                <Text variant="label" color="primary">
                  Done
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={pickerQuery}
              onChangeText={setPickerQuery}
              placeholder="Search Fromage's items"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            {pickerResults.map((item) => (
              <Pressable key={item.id} onPress={() => pickItem(item.id)} style={styles.pickerRow}>
                <Text variant="body" style={{ flex: 1 }}>
                  {item.name}
                </Text>
                <Text variant="caption" color="muted">
                  {item.kcalLow}–{item.kcalHigh}
                </Text>
              </Pressable>
            ))}
            {pickerResults.length === 0 ? (
              <Text variant="caption" color="muted" style={{ marginTop: space8[1] }}>
                No match.
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {!confirmed ? (
        <View style={{ marginTop: space8[6] }}>
          <Button label="Confirm dishes" variant="primary" fullWidth onPress={() => setConfirmed(true)} />
        </View>
      ) : (
        <>
          <Text variant="caption" color="muted" style={{ marginTop: space8[5] }}>
            Estimates are based on a typical stall plate. Yours may differ a bit.
          </Text>
          <View style={{ marginTop: space8[6] }}>
            <Button
              label="Save to Today"
              icon={<Text style={{ color: "white" }}>⬇</Text>}
              variant="cta"
              fullWidth
              loading={saving}
              onPress={onSave}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dishHeader: { flexDirection: "row", alignItems: "center", gap: space8[3] },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000008",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: space8[2] },
  pendingCard: {
    marginTop: space8[4],
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: space8[5],
  },
  segmented: { flexDirection: "row", flexWrap: "wrap", gap: space8[2] },
  segmentBtn: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space8[4],
    paddingVertical: space8[2],
  },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[3],
    marginTop: space8[2],
    gap: space8[2],
  },
  checkBadge: { paddingHorizontal: space8[2], paddingVertical: 2, borderRadius: radii.pill },
  removeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  dashedRow: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.pill,
    paddingVertical: space8[3],
    alignItems: "center",
    marginTop: space8[3],
  },
  pickerPanel: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[3],
    marginTop: space8[3],
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space8[4],
    paddingVertical: space8[2],
    marginTop: space8[2],
    marginBottom: space8[1],
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space8[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
