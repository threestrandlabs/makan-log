import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedMeal {
  id: string;
  dishId: string;
  dishName: string;
  modifierLabels: string[];
  hasEstimate: boolean;
  lo: number;
  hi: number;
  variesALot: boolean;
  savedAt: number;
}

const STORAGE_KEY = "makan-log:saved-meals:v1";

function isToday(ts: number): boolean {
  const a = new Date(ts);
  const b = new Date();
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

async function readAll(): Promise<SavedMeal[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(meals: SavedMeal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

export async function getAllMeals(): Promise<SavedMeal[]> {
  const meals = await readAll();
  return meals.sort((a, b) => b.savedAt - a.savedAt);
}

export async function getTodayMeals(): Promise<SavedMeal[]> {
  const meals = await getAllMeals();
  return meals.filter((m) => isToday(m.savedAt));
}

export async function addMeal(meal: Omit<SavedMeal, "id" | "savedAt">): Promise<SavedMeal> {
  const meals = await readAll();
  const entry: SavedMeal = {
    ...meal,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now(),
  };
  meals.push(entry);
  await writeAll(meals);
  return entry;
}

export async function removeMeal(id: string): Promise<void> {
  const meals = await readAll();
  await writeAll(meals.filter((m) => m.id !== id));
}
