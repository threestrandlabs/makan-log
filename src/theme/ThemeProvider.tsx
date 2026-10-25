import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { colorsFor, type ColorScheme } from "./theme";

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: ReturnType<typeof colorsFor>;
  toggleScheme: () => void;
  setScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const scheme: ColorScheme = override ?? (systemScheme === "dark" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: colorsFor(scheme),
      toggleScheme: () => setOverride(scheme === "dark" ? "light" : "dark"),
      setScheme: (next) => setOverride(next),
    }),
    [scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
