import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Text } from "@/components/Text";
import { PlateIcon } from "@/components/PlateIcon";
import { palette, radii, space8 } from "@/theme/theme";
import { samplePhotos } from "@/data/samplePhotos";
import { setLastUpload } from "@/lib/uploadStore";

export default function CameraScreen() {
  const [busy, setBusy] = useState(false);

  const goRecognise = (params: string) => router.push(`/recognising?${params}`);

  const pickFromLibrary = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo library access to upload a meal photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        setLastUpload(result.assets[0].uri);
        goRecognise("upload=1");
      }
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow camera access to snap a meal photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      if (!result.canceled && result.assets[0]) {
        setLastUpload(result.assets[0].uri);
        goRecognise("upload=1");
      }
    } catch {
      Alert.alert("Camera unavailable", "Try uploading a photo instead, or pick a sample below.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.soy }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.replace("/")}
            style={styles.roundBtn}
          >
            <Text variant="heading" style={{ color: palette.coconut }}>
              ✕
            </Text>
          </Pressable>
          <Text variant="bodyStrong" style={{ color: palette.coconut }}>
            Snap your meal
          </Text>
          <View style={styles.roundBtn}>
            <Text variant="heading" style={{ color: palette.coconut }}>
              ⚡
            </Text>
          </View>
        </View>

        <View style={styles.frame}>
          <View style={styles.plateCard}>
            <PlateIcon size={140} onDarkBackground={false} />
          </View>
          <View style={styles.corner({ top: 0, left: 0 })} />
          <View style={styles.corner({ top: 0, right: 0 })} />
          <View style={styles.corner({ bottom: 0, left: 0 })} />
          <View style={styles.corner({ bottom: 0, right: 0 })} />
          <View style={styles.captionPill}>
            <Text variant="label" style={{ color: palette.coconut }}>
              Fit the whole plate in
            </Text>
          </View>
        </View>

        <Text variant="body" style={{ color: palette.coconut, opacity: 0.75, textAlign: "center", marginTop: space8[4] }}>
          Shoot from above in good light. Already have a photo? Upload it.
        </Text>

        <View style={styles.captureRow}>
          <View style={styles.uploadCol}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upload a photo"
              onPress={pickFromLibrary}
              style={styles.uploadBtn}
            >
              <Text variant="heading" style={{ color: palette.coconut }}>
                ⇧
              </Text>
            </Pressable>
            <Text variant="caption" style={{ color: palette.coconut, marginTop: space8[1] }}>
              Upload
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
            onPress={Platform.OS === "web" ? pickFromLibrary : takePhoto}
            disabled={busy}
            style={[styles.shutterRing, busy && { opacity: 0.6 }]}
          >
            <View style={styles.shutterFill} />
          </Pressable>

          <View style={styles.uploadCol} />
        </View>

        <View style={{ marginTop: space8[8] }}>
          <Text variant="heading" style={{ color: palette.coconut, marginBottom: 2 }}>
            Or try a sample photo
          </Text>
          <Text variant="caption" style={{ color: palette.coconut, opacity: 0.65, marginBottom: space8[3] }}>
            Openly-licensed hawker photos. Recognition is simulated in this demo.
          </Text>
          <View style={styles.grid}>
            {samplePhotos.map((s) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => goRecognise(`sample=${s.id}`)}
                style={styles.sample}
              >
                <Image source={s.image} style={styles.sampleImage} contentFit="cover" />
                <Text variant="caption" style={{ color: palette.coconut, padding: space8[1] }}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  flex: { flex: 1 },
  scroll: { padding: space8[5], paddingBottom: space8[10] },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: space8[4],
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  frame: {
    aspectRatio: 1,
    borderRadius: radii.xl,
    backgroundColor: palette.soySurface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
  },
  plateCard: {
    backgroundColor: palette.coconut,
    borderRadius: radii.lg,
    padding: space8[5],
  },
  corner: (pos: { top?: number; bottom?: number; left?: number; right?: number }) =>
    StyleSheet.flatten([
      { position: "absolute" as const, width: 24, height: 24, borderColor: palette.coconut, opacity: 0.8 },
      pos.top != null && { top: 12, borderTopWidth: 3 },
      pos.bottom != null && { bottom: 12, borderBottomWidth: 3 },
      pos.left != null && { left: 12, borderLeftWidth: 3 },
      pos.right != null && { right: 12, borderRightWidth: 3 },
    ]),
  captionPill: {
    position: "absolute" as const,
    bottom: 16,
    alignSelf: "center" as const,
    backgroundColor: "rgba(30,42,38,0.85)",
    paddingHorizontal: space8[4],
    paddingVertical: space8[2],
    borderRadius: radii.pill,
  },
  captureRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: space8[8],
    paddingHorizontal: space8[2],
  },
  uploadCol: { width: 72, alignItems: "center" as const },
  uploadBtn: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: palette.coconut,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  shutterFill: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: palette.sambal,
  },
  grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: space8[3] },
  sample: {
    width: "31%" as const,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden" as const,
  },
  sampleImage: { width: "100%" as const, aspectRatio: 1 },
};
