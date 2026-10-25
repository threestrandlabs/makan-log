import React from "react";
import { Text as RNText, TextProps } from "react-native";
import { getTextStyle, TextStyleKey } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";

type Props = TextProps & {
  variant?: TextStyleKey;
  color?: "default" | "muted" | "onPrimary" | "onCta" | "primary" | "cta";
};

export function Text({ variant = "body", color = "default", style, ...rest }: Props) {
  const { colors } = useTheme();
  const colorMap = {
    default: colors.text,
    muted: colors.textMuted,
    onPrimary: colors.onPrimary,
    onCta: colors.onCta,
    primary: colors.primary,
    cta: colors.cta,
  } as const;
  return <RNText style={[getTextStyle(variant), { color: colorMap[color] }, style]} {...rest} />;
}
