import { getItem } from "./calc";
import type { NutritionItem, RangeEstimate, RiceOption } from "./types";

/**
 * SPEC "Mixed plates" section: a mixed/cai-png-style plate is built live from Fromage's items
 * (the dietitian's calorie-ranges-v0.1 rows prefixed cp_*) rather than a single fixed composite
 * like dishCatalog's `cai_png` entry. Rice is its own row (not a "side"); the rest are sides.
 */
const RICE_ITEM_ID: Record<Exclude<RiceOption, "none">, string> = {
  full: "cp_rice_full",
  less: "cp_rice_less",
  half: "cp_rice_half",
};

export const MIXED_PLATE_SIDE_ITEM_IDS = [
  "cp_meat_sspork",
  "cp_meat_currychicken",
  "cp_veg_cabbage",
  "cp_veg_kailan",
  "cp_egg_fried",
  "cp_tofu_hongshao",
  "cp_fried_cutlet",
  "cp_fried_fish_ss",
];

export function getMixedPlateSideOptions(): NutritionItem[] {
  return MIXED_PLATE_SIDE_ITEM_IDS.map(getItem).filter((i): i is NutritionItem => !!i);
}

/** "closest matches ... plus a search box" - a plain substring filter over the side catalog. */
export function searchMixedPlateSides(query: string): NutritionItem[] {
  const options = getMixedPlateSideOptions();
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((i) => i.name.toLowerCase().includes(q) || i.variant.toLowerCase().includes(q));
}

export function riceItemFor(option: RiceOption): NutritionItem | undefined {
  return option === "none" ? undefined : getItem(RICE_ITEM_ID[option]);
}

const floor10 = (v: number) => Math.floor(v / 10) * 10;
const ceil10 = (v: number) => Math.ceil(v / 10) * 10;

export interface MixedPlateEstimate extends RangeEstimate {
  /** Side dishIds selected in the UI that have no row in Fromage's items - surfaced so the UI
   * can "say so" rather than invent a number for them (SPEC). */
  missingSideIds: string[];
}

/** Sum of each selected side's low/high plus the chosen rice option's low/high. Never fabricates
 * a number for a side with no data - it's excluded from the sum and reported in missingSideIds. */
export function computeMixedPlateRange(sideItemIds: string[], rice: RiceOption): MixedPlateEstimate {
  const riceItem = riceItemFor(rice);
  const missingSideIds = sideItemIds.filter((id) => !getItem(id));
  const resolvedSides = sideItemIds.map(getItem).filter((i): i is NutritionItem => !!i);
  const parts = riceItem ? [riceItem, ...resolvedSides] : resolvedSides;

  if (!parts.length) {
    return { hasEstimate: false, lo: 0, hi: 0, variesALot: false, missingSideIds };
  }

  const lo = Math.max(0, floor10(parts.reduce((sum, p) => sum + (p.kcalLow ?? 0), 0)));
  const hiRaw = ceil10(parts.reduce((sum, p) => sum + (p.kcalHigh ?? 0), 0));
  const hi = Math.max(lo, hiRaw);
  const variesALot = parts.some((p) => p.variesALot);

  return { hasEstimate: true, lo, hi, variesALot, missingSideIds };
}

export const RICE_LABEL: Record<RiceOption, string> = {
  full: "Full rice",
  less: "Less rice",
  half: "Half rice",
  none: "No rice",
};
