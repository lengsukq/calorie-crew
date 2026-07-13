"use client";

import { useCallback, useEffect, useState } from "react";

const RECENT_FOODS_KEY = "calorie_crew_recent_foods";
const MAX_RECENT = 6;

export function useRecentFoods() {
  const [recentFoods, setRecentFoods] = useState<FoodLogEntryLite[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_FOODS_KEY);
      if (raw) setRecentFoods(JSON.parse(raw) as FoodLogEntryLite[]);
    } catch {
      // localStorage may be unavailable or corrupted; ignore and start empty.
    }
  }, []);

  const addRecentFoods = useCallback((items: FoodLogEntryLite[]) => {
    setRecentFoods((current) => {
      const merged = [...items, ...current].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(merged));
      } catch {
        // Storage write failure is non-fatal for this UX-only feature.
      }
      return merged;
    });
  }, []);

  const clearRecentFoods = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_FOODS_KEY);
    } catch {
      // ignore
    }
    setRecentFoods([]);
  }, []);

  return { recentFoods, addRecentFoods, clearRecentFoods };
}

export interface FoodLogEntryLite {
  mealType: string;
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
