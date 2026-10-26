import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Text";
import { palette, space8, radii } from "@/theme/theme";
import { resolvePhotoParams } from "@/lib/photoFromParams";
import { RECOGNITION_DELAY_MS, resolveRecognition } from "@/data/recogniser";

const STEPS = ["Spotting what's on the plate", "Sizing up the portion", "Matching to local hawker dishes…"];

export default function RecognisingScreen() {
  const params = useLocalSearchParams<{ sample?: string; upload?: string }>();
  const photo = resolvePhotoParams(params);
  const recognition = resolveRecognition(photo.input);
  const [stepIndex, setStepIndex] = useState(0);

  const query = params.upload === "1" ? "upload=1" : `sample=${photo.input.kind === "sample" ? photo.input.sampleId : ""}`;
  const destination = recognition.type === "mixed" ? `/confirm?mixed=1&${query}` : `/results?${query}`;

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, Math.max(1, Math.floor(RECOGNITION_DELAY_MS / STEPS.length)));

    const navTimer = setTimeout(() => {
      router.replace(destination);
    }, RECOGNITION_DELAY_MS);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.coconut }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace("/camera")}>
          <Text variant="bodyStrong" color="primary">
            Cancel
          </Text>
        </Pressable>
        <Text variant="heading">Snap your meal</Text>
        <View style={{ width: 56 }} />
      </View>

      <View style={[styles.frameWrap, { backgroundColor: palette.soy }]}>
        <Image source={photo.source} style={styles.photo} contentFit="cover" />
        <View style={styles.scanline} />
        <View style={styles.corner({ top: 0, left: 0 })} />
        <View style={styles.corner({ top: 0, right: 0 })} />
        <View style={styles.corner({ bottom: 0, left: 0 })} />
        <View style={styles.corner({ bottom: 0, right: 0 })} />
      </View>

      <Text variant="title" style={{ marginTop: space8[6] }}>
        Recognising…
      </Text>
      <Text variant="body" color="muted" style={{ marginTop: space8[1] }}>
        Hold on, we&apos;re checking what&apos;s on your plate.
      </Text>

      <View style={{ marginTop: space8[5], gap: space8[3] }}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            {i < stepIndex ? (
              <View style={[styles.stepIcon, { backgroundColor: palette.pandan }]}>
                <Text variant="caption" style={{ color: palette.coconut }}>
                  ✓
                </Text>
              </View>
            ) : i === stepIndex ? (
              <View style={[styles.stepIcon, styles.stepIconPending, { borderColor: palette.pandan }]}>
                <View style={[styles.stepDot, { backgroundColor: palette.kaya }]} />
              </View>
            ) : (
              <View style={[styles.stepIcon, styles.stepIconPending, { borderColor: "#00000022" }]} />
            )}
            <Text variant="bodyStrong" style={{ opacity: i <= stepIndex ? 1 : 0.4 }}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.replace(destination)} style={{ marginTop: space8[10], alignSelf: "center" }}>
        <Text variant="label" color="primary" style={{ textDecorationLine: "underline", fontWeight: "700" as const }}>
          Prototype: tap to see the results
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = {
  flex: { flex: 1, padding: space8[5], paddingTop: space8[6] } as const,
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: space8[4],
  },
  frameWrap: {
    aspectRatio: 1,
    borderRadius: radii.xl,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  photo: { width: "100%" as const, height: "100%" as const, opacity: 0.92 },
  scanline: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: "28%" as const,
    height: 2,
    backgroundColor: palette.kaya,
  },
  corner: (pos: { top?: number; bottom?: number; left?: number; right?: number }) =>
    StyleSheet.flatten([
      {
        position: "absolute" as const,
        width: 24,
        height: 24,
        borderColor: palette.pandan,
      },
      pos.top != null && { top: 12, borderTopWidth: 3 },
      pos.bottom != null && { bottom: 12, borderBottomWidth: 3 },
      pos.left != null && { left: 12, borderLeftWidth: 3 },
      pos.right != null && { right: 12, borderRightWidth: 3 },
    ]),
  stepRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: space8[3] },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stepIconPending: { borderWidth: 2 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
};
