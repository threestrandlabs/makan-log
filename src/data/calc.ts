import itemsJson from "./generated/items.json";
import modifiersJson from "./generated/modifiers.json";
import type { DishDef, NutritionItem, NutritionModifier, RangeEstimate } from "./types";

const items = itemsJson as NutritionItem[];
const modifiers = modifiersJson as NutritionModifier[];

const itemsById = new Map(items.map((i) => [i.id, i]));
const modifiersById = new Map(modifiers.map((m) => [m.id, m]));

export function getItem(id: string): NutritionItem | undefined {
  return itemsById.get(id);
}

export function getModifier(id: string): NutritionModifier | undefined {
  return modifiersById.get(id);
}

export function modifiersFor(dish: DishDef): NutritionModifier[] {
  const ids = [...(dish.riceModifierIds ?? []), ...dish.modifierIds];
  return ids.map((id) => modifiersById.get(id)).filter((m): m is NutritionModifier => !!m);
}

const floor10 = (v: number) => Math.floor(v / 10) * 10;
const ceil10 = (v: number) => Math.ceil(v / 10) * 10;

const EMPTY: RangeEstimate = { hasEstimate: false, lo: 0, hi: 0, variesALot: false };

/** Pure range calculation: base dish range (or sum of parts for a composite), plus the delta
 * from any selected modifiers. Never fabricates a number - dishes/items with no CSV data, or
 * composites with no parts, resolve to hasEstimate: false. */
export function computeRange(dish: DishDef, selectedModifierIds: string[]): RangeEstimate {
  if (dish.kind === "unavailable") return EMPTY;

  const selected = new Set(selectedModifierIds);
  const appliedModifiers = modifiersFor(dish).filter((m) => selected.has(m.id));

  if (dish.kind === "item") {
    const item = dish.itemId ? itemsById.get(dish.itemId) : undefined;
    if (!item || item.kcalLow == null || item.kcalHigh == null) return EMPTY;
    let lo = item.kcalLow;
    let hi = item.kcalHigh;
    for (const m of appliedModifiers) {
      lo += m.kcalDeltaLow;
      hi += m.kcalDeltaHigh;
    }
    lo = Math.max(0, floor10(lo));
    hi = Math.max(lo, ceil10(hi));
    return { hasEstimate: true, lo, hi, variesALot: item.variesALot };
  }

  // composite (cai png): sum the parts, then apply modifier deltas, then cap at +-45% of the
  // summed point value per the dietitian's method note (calorie-ranges-v0.1.md, step 5).
  const parts = (dish.partItemIds ?? []).map((id) => itemsById.get(id)).filter((p): p is NutritionItem => !!p);
  if (!parts.length) return EMPTY;

  let lo = parts.reduce((sum, p) => sum + (p.kcalLow ?? 0), 0);
  let hi = parts.reduce((sum, p) => sum + (p.kcalHigh ?? 0), 0);
  const point = parts.reduce((sum, p) => sum + (p.kcalPoint ?? 0), 0);
  const variesALot = parts.some((p) => p.variesALot);

  for (const m of appliedModifiers) {
    lo += m.kcalDeltaLow;
    hi += m.kcalDeltaHigh;
  }

  lo = Math.max(lo, floor10(point * 0.55));
  hi = Math.min(hi, ceil10(point * 1.45));
  lo = Math.max(0, floor10(lo));
  hi = Math.max(lo, ceil10(hi));

  return { hasEstimate: true, lo, hi, variesALot };
}

export function formatRange(estimate: RangeEstimate): string {
  if (!estimate.hasEstimate) return "No estimate yet";
  const fmt = (n: number) => n.toLocaleString("en-SG");
  return `${fmt(estimate.lo)}–${fmt(estimate.hi)} kcal estimate`;
}

export function modifierDeltaLabel(m: NutritionModifier): string {
  if (m.kcalDeltaLow === 0 && m.kcalDeltaHigh === 0) return "about the same";
  const lo = Math.abs(m.kcalDeltaLow);
  const hi = Math.abs(m.kcalDeltaHigh);
  const [a, b] = lo < hi ? [lo, hi] : [hi, lo];
  return m.kcalDeltaHigh <= 0 ? `-${a}–${b} kcal` : `+${a}–${b} kcal`;
}
