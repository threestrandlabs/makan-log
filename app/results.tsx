import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { VariesBadge } from "@/components/Badge";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { resolvePhotoParams } from "@/lib/photoFromParams";
import { resolveGuesses } from "@/data/recogniser";
import { nutritionSource } from "@/data/nutritionSource";
import { formatRange } from "@/data/calc";
import type { DishGuess } from "@/data/types";

const CONFIDENCE_LABEL: Record<DishGuess["confidence"], string> = {
  high: "Best guess",
  medium: "Or maybe",
  low: "Possibly",
};

export default function ResultsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sample?: string; upload?: string }>();
  const photo = resolvePhotoParams(params);
  const guesses = resolveGuesses(photo.input);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const photoQuery = photo.isUpload ? "upload=1" : `sample=${photo.input.kind === "sample" ? photo.input.sampleId : ""}`;

  const searchResults = useMemo(() => (searching ? nutritionSource.search(query) : []), [searching, query]);

  const openDish = (dishId: string) => router.push(`/confirm?dish=${dishId}&${photoQuery}`);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retake photo" onPress={() => router.replace("/camera")}>
          <Text variant="bodyStrong" color="primary">
            ‹ Retake
          </Text>
        </Pressable>
        <Text variant="heading">Snap your meal</Text>
        <View style={{ width: 64 }} />
      </View>

      <View>
        <View style={[styles.photoWrap, { borderColor: colors.border }]}>
          <Image source={photo.source} style={styles.photo} contentFit="cover" />
        </View>

        <Text variant="title" style={{ marginTop: space8[5] }}>
          Is it one of these?
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: space8[1], marginBottom: space8[3] }}>
          Our best guesses. Tap the one that looks right.
        </Text>

        {guesses.map((g, i) => {
          const dish = nutritionSource.getDish(g.dishId);
          if (!dish) return null;
          const estimate = nutritionSource.applyModifiers(dish.id, []);
          return (
            <Pressable
              key={`${g.dishId}-${i}`}
              onPress={() => openDish(dish.id)}
              style={[
                styles.guessRow,
                {
                  borderColor: i === 0 ? colors.primary : colors.border,
                  backgroundColor: i === 0 ? colors.primarySoft : colors.surface,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="caption" color={i === 0 ? "primary" : "muted"}>
                  {CONFIDENCE_LABEL[g.confidence]}
                </Text>
                <Text variant="bodyStrong">{dish.name}</Text>
                <View style={styles.rangeRow}>
                  <Text variant="label" color={estimate.hasEstimate ? "primary" : "muted"}>
                    {formatRange(estimate)}
                  </Text>
                  {estimate.variesALot ? <VariesBadge /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}

        <Pressable onPress={() => setSearching((s) => !s)} style={{ marginTop: space8[4] }}>
          <Text variant="bodyStrong" color="primary">
            {searching ? "Hide search" : "None of these? Search instead"}
          </Text>
        </Pressable>

        {searching && (
          <View style={{ marginTop: space8[3] }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search hawker dishes"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { borderColor: colors.border, color: colors.text }]}
            />
            {searchResults.map((dish) => {
              const estimate = nutritionSource.applyModifiers(dish.id, []);
              return (
                <Pressable
                  key={dish.id}
                  onPress={() => openDish(dish.id)}
                  style={[styles.searchRow, { borderColor: colors.border }]}
                >
                  <Text variant="body" style={{ flex: 1 }}>
                    {dish.name}
                  </Text>
                  <Text variant="label" color={estimate.hasEstimate ? "primary" : "muted"}>
                    {estimate.hasEstimate ? `${estimate.lo}–${estimate.hi}` : "—"}
                  </Text>
                </Pressable>
              );
            })}
            {searching && query && searchResults.length === 0 ? (
              <Text variant="caption" color="muted">
                No match. Try &quot;rice&quot;, &quot;noodles&quot; or &quot;prata&quot;.
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: space8[3],
  },
  photoWrap: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    aspectRatio: 16 / 9,
  },
  photo: { width: "100%", height: "100%" },
  guessRow: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[3],
    marginBottom: space8[2],
    flexDirection: "row",
    alignItems: "center",
  },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: space8[2], marginTop: 4 },
  searchInput: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: space8[4],
    paddingVertical: space8[2],
    marginBottom: space8[2],
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: space8[2],
  },
});
