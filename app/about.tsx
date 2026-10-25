import { View } from "react-native";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TopBar } from "@/components/TopBar";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, space8 } from "@/theme/theme";
import meta from "@/data/generated/meta.json";
import { samplePhotos } from "@/data/samplePhotos";

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <TopBar title="About these estimates" fallbackRoute="/" />

      <View style={[card(colors.surface, colors.border)]}>
        <Text variant="bodyStrong">Ranges, not exact numbers</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          The same dish can differ a lot between stalls (rice portion, oil, gravy), so we show a
          range and call it an estimate, never one exact number.
        </Text>
      </View>

      <View style={[card(colors.surface, colors.border), { marginTop: space8[3] }]}>
        <Text variant="bodyStrong">Varies a lot</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Shown when sources disagree a lot, or the portion is hard to pin down.
        </Text>
      </View>

      <View style={[card(colors.surface, colors.border), { marginTop: space8[3] }]}>
        <Text variant="bodyStrong">No estimate yet</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Some dishes in our sample photos (like hokkien mee or satay) aren&apos;t in our data yet.
          We never invent a number - we just say so.
        </Text>
      </View>

      <View style={[card(colors.surface, colors.border), { marginTop: space8[3] }]}>
        <Text variant="label" style={{ marginBottom: space8[1] }}>
          Data notice
        </Text>
        <Text variant="caption">{meta.attribution}</Text>
      </View>

      <View style={[card(colors.surface, colors.border), { marginTop: space8[3] }]}>
        <Text variant="label" style={{ marginBottom: space8[1] }}>
          Sample photo credits
        </Text>
        {samplePhotos.map((s) => (
          <Text key={s.id} variant="caption" style={{ marginTop: 2 }}>
            {s.label}: {s.credit}
          </Text>
        ))}
      </View>

      <View style={[card(colors.surface, colors.border), { marginTop: space8[3] }]}>
        <Text variant="caption">
          {meta.disclaimer} If you have a medical condition, are pregnant, or are under 18, please
          check with a doctor or dietitian. Photo recognition in this demo is simulated. Sample
          food photos are real, openly-licensed hawker photos (see credits above).
        </Text>
      </View>
    </Screen>
  );
}

function card(bg: string, border: string) {
  return {
    backgroundColor: bg,
    borderColor: border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: space8[4],
  };
}
