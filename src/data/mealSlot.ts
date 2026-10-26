export type MealSlot = "breakfast" | "lunch" | "tea" | "dinner" | "supper";
export type CoreMealSlot = "breakfast" | "lunch" | "dinner";

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  tea: "Tea time",
  dinner: "Dinner",
  supper: "Supper",
};

const CORE_SLOTS: CoreMealSlot[] = ["breakfast", "lunch", "dinner"];

/** Local-time-of-day guess at which meal slot we're in, for display only (there's no slot
 * picker in this demo - see docs/decisions.md). */
export function slotForDate(d: Date): MealSlot {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < 4) return "supper";
  if (h < 10.5) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 17.5) return "tea";
  if (h < 22) return "dinner";
  return "supper";
}

/** The earliest core slot (breakfast/lunch/dinner) that's "due" by now and hasn't been logged
 * yet, for the Today screen's "Dinner? Snap it when it's served" prompt. */
export function nextUnloggedCoreSlot(loggedSlots: Set<MealSlot>, now: Date): CoreMealSlot | null {
  const hour = now.getHours();
  const dueIdx = hour < 11 ? 0 : hour < 17 ? 1 : 2;
  for (let i = 0; i <= dueIdx; i++) {
    if (!loggedSlots.has(CORE_SLOTS[i])) return CORE_SLOTS[i];
  }
  return null;
}

const COUNT_WORD = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/** "Two meals in. Got dinner coming?" / "Three meals in. Shiok." style Today subtitle. */
export function todaySubtitle(mealCount: number, loggedSlots: Set<MealSlot>, now: Date): string {
  if (mealCount === 0) return "Nothing yet today.";
  const count = mealCount < COUNT_WORD.length ? COUNT_WORD[mealCount] : String(mealCount);
  const noun = mealCount === 1 ? "meal" : "meals";
  const next = nextUnloggedCoreSlot(loggedSlots, now);
  if (!next) return `${count} ${noun} in. Shiok.`;
  return `${count} ${noun} in. Got ${next} coming?`;
}
