export interface NutritionItem {
  id: string;
  name: string;
  variant: string;
  portionG: number | null;
  kcalPoint: number | null;
  kcalLow: number | null;
  kcalHigh: number | null;
  source: string;
  hpbId: string | null;
  confidence: string;
  rangeRule: string;
  variesALot: boolean;
  hpbUrl: string | null;
}

export interface NutritionModifier {
  id: string;
  appliesTo: string[];
  kcalDeltaLow: number;
  kcalDeltaHigh: number;
  label: string;
  basis: string;
  source: string;
  confidence: string;
}

export type DishKind = "item" | "composite" | "unavailable";

/** A pickable dish in the app: either a single CSV row, a sum of CSV rows (cai png), or a
 * recognised name that has no calorie data yet (so the app must show no number). */
export interface DishDef {
  id: string;
  name: string;
  portionLabel: string;
  kind: DishKind;
  itemId?: string;
  partItemIds?: string[];
  /** Modifier ids offered as tweak chips, in display order. Rice-size modifiers within the
   * same riceGroup are mutually exclusive (see modifiers CSV "Stacking rules"). */
  modifierIds: string[];
  riceModifierIds?: string[];
  image?: string;
}

export interface RangeEstimate {
  hasEstimate: boolean;
  lo: number;
  hi: number;
  variesALot: boolean;
  closestMatchNote?: string;
}

export type Confidence = "high" | "medium" | "low";

export interface DishGuess {
  dishId: string;
  confidence: Confidence;
}

export type RiceOption = "full" | "less" | "half" | "none";

export interface MixedSideGuess {
  dishId: string;
  confidence: Confidence;
  /** The recogniser isn't sure this side is right - surfaced as a "check this" marker. */
  uncertain: boolean;
}

/** SPEC "Mixed plates" section: a mixed/cai-png-style plate doesn't get a top-3 whole-dish
 * guess list like a single dish does - it gets a rice call plus one guess per side. */
export type RecognitionResult =
  | { type: "single"; guesses: DishGuess[] }
  | { type: "mixed"; rice: RiceOption; sides: MixedSideGuess[] };
