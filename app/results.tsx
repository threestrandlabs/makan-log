import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { VariesBadge } from "@/components/Badge";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import { resolvePhotoParams } from "@/lib/photoFromParams";
import { resolveRecognition } from "@/data/recogniser";
import { nutritionSource } from "@/data/nutritionSource";
import { formatRange } from "@/data/calc";
import type { Confidence } from "@/data/types";

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Best match",
  medium: "Worth a look",
  low: "Possibly",
};

export default function ResultsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sample?: string; upload?: string }>();
  const photo = resolvePhotoParams(params);
  const recognition = resolveRecognition(photo.input);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const photoQuery = photo.isUpload ? "upload=1" : `sample=${photo.input.kind === "sample" ? photo.input.sampleId : ""}`;

  // SPEC "Mixed plates": a mixed plate has no top-3 whole-dish guess list - it goes straight to
  // the mixed-plate Confirm layout (rice row + side chips). Covers direct deep links too.
  useEffect(() => {
    if (recognition.type === "mixed") {
      router.replace(`/confirm?mixed=1&${photoQuery}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.type]);

  const searchResults = useMemo(() => (searching ? nutritionSource.search(query) : []), [searching, query]);

  const openDish = (dishId: string) => router.push(`/confirm?dish=${dishId}&${photoQuery}`);

  if (recognition.type === "mixed") return null;
  const guesses = recognition.guesses;

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
          Our best guesses, closest first. Tap the one that fits.
        </Text>

        {guesses.map((g, i) => {
          const dish = nutritionSource.getDish(g.dishId);
          if (!dish) return null;
          const estimate = nutritionSource.applyModifiers(dish.id, []);
          const isTop = i === 0;
          return (
            <Pressable
              key={`${g.dishId}-${i}`}
              onPress={() => openDish(dish.id)}
              style={[
                styles.guessRow,
                { borderColor: isTop ? colors.primary : colors.border, backgroundColor: colors.surface },
              ]}
            >
              <View style={[styles.numberBadge, isTop ? { backgroundColor: colors.primary } : { borderColor: colors.border, borderWidth: 1 }]}>
                <Text variant="bodyStrong" style={{ color: isTop ? colors.onPrimary : colors.textMuted }}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                {isTop ? (
                  <View style={[styles.matchPill, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" style={{ color: colors.onPrimary, fontWeight: "700" as const }}>
                      {CONFIDENCE_LABEL[g.confidence]}
                    </Text>
                  </View>
                ) : null}
                <Text variant="bodyStrong">{dish.name}</Text>
                <View style={styles.rangeRow}>
                  <Text variant="label" color={estimate.hasEstimate ? "primary" : "muted"}>
                    {formatRange(estimate)}
                  </Text>
                  {estimate.variesALot ? <VariesBadge /> : null}
                </View>
              </View>
              {isTop ? (
                <Text variant="heading" color="primary">
                  ›
                </Text>
              ) : null}
            </Pressable>
          );
        })}

        <View style={styles.searchPrompt}>
          <Text variant="body" color="muted">
            None of these?
          </Text>
          <Pressable onPress={() => setSearching((s) => !s)}>
            <Text variant="bodyStrong" color="primary" style={styles.searchLink}>
              ⌕ {searching ? "Hide search" : "Search instead"}
            </Text>
          </Pressable>
        </View>

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
    gap: space8[3],
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  matchPill: {
    alignSelf: "flex-start",
    paddingHorizontal: space8[2],
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginBottom: 2,
  },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: space8[2], marginTop: 4 },
  searchPrompt: {
    alignItems: "center",
    marginTop: space8[5],
    gap: space8[1],
  },
  searchLink: { textDecorationLine: "underline" },
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
