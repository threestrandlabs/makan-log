import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { PlateIcon } from "@/components/PlateIcon";
import { useTheme } from "@/theme/ThemeProvider";
import { palette, radii, space8 } from "@/theme/theme";
import { samplePhotos } from "@/data/samplePhotos";
import { setLastUpload } from "@/lib/uploadStore";

export default function CameraScreen() {
  const { colors } = useTheme();
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
    <Screen>
      <Text variant="title" style={{ marginBottom: space8[4] }}>
        Snap your meal
      </Text>

      <View style={[styles.preview, { backgroundColor: palette.soy, borderColor: colors.border }]}>
        <PlateIcon size={140} onDarkBackground />
        <Text variant="label" style={{ color: palette.coconut, marginTop: space8[3] }}>
          Frame the whole plate
        </Text>
      </View>

      <View style={{ marginTop: space8[5], gap: space8[2] }}>
        <Button label="Upload a photo" variant="primary" fullWidth loading={busy} onPress={pickFromLibrary} />
        {Platform.OS !== "web" && (
          <Button label="Take a photo" variant="outline" fullWidth loading={busy} onPress={takePhoto} />
        )}
      </View>

      <View style={{ marginTop: space8[8] }}>
        <Text variant="heading" style={{ marginBottom: space8[1] }}>
          Or try a sample photo
        </Text>
        <Text variant="caption" color="muted" style={{ marginBottom: space8[3] }}>
          Openly-licensed hawker photos. Recognition is simulated in this demo.
        </Text>
        <View style={styles.grid}>
          {samplePhotos.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => goRecognise(`sample=${s.id}`)}
              style={[styles.sample, { borderColor: colors.border }]}
            >
              <Image source={s.image} style={styles.sampleImage} contentFit="cover" />
              <Text variant="caption" style={{ padding: space8[1] }}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: radii.xl,
    borderWidth: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space8[3] },
  sample: {
    width: "31%",
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  sampleImage: { width: "100%", aspectRatio: 1 },
});
