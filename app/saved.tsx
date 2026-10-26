import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { TodayContent } from "@/components/TodayContent";
import { Toast } from "@/components/Toast";
import { getTodayMeals } from "@/data/savedMeals";

export default function SavedScreen() {
  const params = useLocalSearchParams<{ mealId?: string }>();
  const [showToast, setShowToast] = useState(true);
  const [mealId, setMealId] = useState<string | undefined>(params.mealId);

  // SPEC: "/saved" works with a sensible default when opened directly - fall back to today's
  // most recent meal so the highlight + toast still make sense without a mealId param.
  useEffect(() => {
    if (params.mealId) {
      setMealId(params.mealId);
      return;
    }
    getTodayMeals().then((meals) => setMealId(meals[0]?.id));
  }, [params.mealId]);

  useEffect(() => {
    const t = setTimeout(() => setShowToast(false), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen overlay={showToast ? <Toast label="Saved to Today" /> : null}>
      <TodayContent highlightMealId={mealId} />
    </Screen>
  );
}
