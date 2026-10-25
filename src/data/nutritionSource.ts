import { dishCatalog, findDish } from "./dishCatalog";
import { computeRange, modifiersFor } from "./calc";
import type { DishDef, NutritionModifier, RangeEstimate } from "./types";

/**
 * Swappable data-layer interface (SPEC: "Access via a swappable data-layer interface").
 * JsonNutritionSource below is the only implementation for v0.1, backed by the JSON generated
 * from the dietitian's CSVs (src/data/generated). A future implementation (bundled SQLite,
 * remote API, ...) only needs to satisfy this interface.
 */
export interface NutritionSource {
  getDish(id: string): DishDef | undefined;
  search(query: string): DishDef[];
  getModifiers(dishId: string): NutritionModifier[];
  applyModifiers(dishId: string, modifierIds: string[]): RangeEstimate;
}

export class JsonNutritionSource implements NutritionSource {
  getDish(id: string): DishDef | undefined {
    return findDish(id);
  }

  search(query: string): DishDef[] {
    const q = query.trim().toLowerCase();
    if (!q) return dishCatalog;
    return dishCatalog.filter(
      (d) => d.name.toLowerCase().includes(q) || d.portionLabel.toLowerCase().includes(q)
    );
  }

  getModifiers(dishId: string): NutritionModifier[] {
    const dish = findDish(dishId);
    if (!dish) return [];
    return modifiersFor(dish);
  }

  applyModifiers(dishId: string, modifierIds: string[]): RangeEstimate {
    const dish = findDish(dishId);
    if (!dish) return { hasEstimate: false, lo: 0, hi: 0, variesALot: false };
    return computeRange(dish, modifierIds);
  }
}

export const nutritionSource: NutritionSource = new JsonNutritionSource();
