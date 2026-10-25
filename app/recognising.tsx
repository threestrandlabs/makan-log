import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Text";
import { palette, space8, radii } from "@/theme/theme";
import { resolvePhotoParams } from "@/lib/photoFromParams";
import { RECOGNITION_DELAY_MS } from "@/data/recogniser";

const STEPS = ["Spotting what's on your plate", "Sizing up the portion", "Matching to local hawker dishes"];

export default function RecognisingScreen() {
  const params = useLocalSearchParams<{ sample?: string; upload?: string }>();
  const photo = resolvePhotoParams(params);
  const [stepIndex, setStepIndex] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [spin]);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, Math.max(1, Math.floor(RECOGNITION_DELAY_MS / STEPS.length)));

    const query = params.upload === "1" ? "upload=1" : `sample=${photo.input.kind === "sample" ? photo.input.sampleId : ""}`;
    const navTimer = setTimeout(() => {
      router.replace(`/results?${query}`);
    }, RECOGNITION_DELAY_MS);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[styles.flex, { backgroundColor: palette.soy }]}>
      <View style={styles.frameWrap}>
        <Image source={photo.source} style={styles.photo} contentFit="cover" />
        <View style={styles.corner({ top: 0, left: 0 })} />
        <View style={styles.corner({ top: 0, right: 0 })} />
        <View style={styles.corner({ bottom: 0, left: 0 })} />
        <View style={styles.corner({ bottom: 0, right: 0 })} />
      </View>

      <Text variant="title" style={{ color: palette.coconut, marginTop: space8[6] }}>
        Recognising…
      </Text>
      <Text variant="body" style={{ color: palette.coconut, opacity: 0.75, marginTop: space8[1] }}>
        Hold on while we check what&apos;s on your plate.
      </Text>

      <View style={{ marginTop: space8[5], gap: space8[2] }}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.stepRow}>
            <Animated.View
              style={[
                styles.stepDot,
                { backgroundColor: i <= stepIndex ? palette.pandanLight : "rgba(255,255,255,0.2)" },
                i === stepIndex && { transform: [{ rotate }] },
              ]}
            />
            <Text variant="body" style={{ color: palette.coconut, opacity: i <= stepIndex ? 1 : 0.5 }}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => {
          const query = params.upload === "1" ? "upload=1" : `sample=${photo.input.kind === "sample" ? photo.input.sampleId : ""}`;
          router.replace(`/results?${query}`);
        }}
        style={{ marginTop: space8[8] }}
      >
        <Text variant="label" style={{ color: palette.pandanLight }}>
          In a hurry? Tap to see the results
        </Text>
      </Pressable>
    </View>
  );
}

const styles = {
  flex: { flex: 1, padding: space8[5], paddingTop: space8[10] } as const,
  frameWrap: {
    aspectRatio: 1,
    borderRadius: radii.xl,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  photo: { width: "100%" as const, height: "100%" as const, opacity: 0.9 },
  corner: (pos: { top?: number; bottom?: number; left?: number; right?: number }) =>
    StyleSheet.flatten([
      {
        position: "absolute" as const,
        width: 24,
        height: 24,
        borderColor: palette.kaya,
      },
      pos.top != null && { top: 12, borderTopWidth: 3 },
      pos.bottom != null && { bottom: 12, borderBottomWidth: 3 },
      pos.left != null && { left: 12, borderLeftWidth: 3 },
      pos.right != null && { right: 12, borderRightWidth: 3 },
    ]),
  stepRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: space8[2] },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
};
