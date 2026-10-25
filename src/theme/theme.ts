import tokens from "./tokens.generated";

export type ColorScheme = "light" | "dark";

const { color, font, text, space, radius, elevation, size, motion } = tokens;

// color.* are the light-mode values; color.dark.* holds the dark twins (see tokens-v0.1.json $meta.theming).
const semanticKeys = [
  "bg",
  "surface",
  "surfaceAlt",
  "border",
  "text",
  "textMuted",
  "primary",
  "onPrimary",
  "primarySoft",
  "cta",
  "onCta",
  "accent",
  "highlight",
  "onHighlight",
  "highlightSoft",
  "strand1",
  "strand2",
  "strand3",
  "focus",
] as const;

type SemanticKey = (typeof semanticKeys)[number];
type SemanticColors = Record<SemanticKey, string>;

const lightColors: SemanticColors = semanticKeys.reduce((acc, key) => {
  acc[key] = color[key];
  return acc;
}, {} as SemanticColors);

const darkColors: SemanticColors = semanticKeys.reduce((acc, key) => {
  acc[key] = (color.dark as Record<string, string>)[key] ?? color[key];
  return acc;
}, {} as SemanticColors);

export const palette = {
  pandan: color.pandan,
  pandanLight: color.pandanLight,
  sambal: color.sambal,
  sambalDeep: color.sambalDeep,
  kaya: color.kaya,
  coconut: color.coconut,
  soy: color.soy,
  soySurface: color.soySurface,
  white: color.white,
};

export function colorsFor(scheme: ColorScheme): SemanticColors {
  return scheme === "dark" ? darkColors : lightColors;
}

const headingWeights: Record<number, string> = {
  500: "Outfit_500Medium",
  600: "Outfit_600SemiBold",
  700: "Outfit_700Bold",
};
const bodyWeights: Record<number, string> = {
  400: "DMSans_400Regular",
  500: "DMSans_500Medium",
  700: "DMSans_700Bold",
};

export const fontFamiliesWeb = {
  heading: font.heading,
  body: font.body,
};

export const textStyles = text;
export const space8 = space;
export const radii = radius;
export const elevations = elevation;
export const sizes = size;
export const motionDurations = motion;

export const meta = tokens.$meta;

export type TextStyleKey = keyof typeof text;

/** Resolves a tokens-v0.1.json text.* entry to an RN-safe style (font family, size, line height). */
export function getTextStyle(key: TextStyleKey) {
  const t = text[key];
  const family = t.font === "heading" ? headingWeights[t.weight] : bodyWeights[t.weight];
  return {
    fontFamily: family,
    fontSize: t.size,
    lineHeight: Math.round(t.size * t.lineHeight),
  } as const;
}
