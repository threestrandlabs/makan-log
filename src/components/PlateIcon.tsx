import React from "react";
import { Image } from "expo-image";
import { useTheme } from "@/theme/ThemeProvider";

const plateLight = require("../../assets/images/plate-light-1024.png");
const plateDark = require("../../assets/images/plate-dark-1024.png");

type Props = { size?: number; onDarkBackground?: boolean };

/** The cai-fan-plate brand mark (brand/BRAND-SPEC.md), used as the photo/camera placeholder. */
export function PlateIcon({ size = 120, onDarkBackground }: Props) {
  const { scheme } = useTheme();
  const useDark = onDarkBackground ?? scheme === "dark";
  return (
    <Image
      source={useDark ? plateDark : plateLight}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel="Makan Log plate mark"
    />
  );
}
