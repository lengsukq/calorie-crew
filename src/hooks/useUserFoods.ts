"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createUserFood,
  deleteUserFood,
  fetchUserFoods,
  markUserFoodUsed,
  updateUserFood,
} from "@/lib/api/user-foods";
import type { UserFoodEntry, UserFoodFormData } from "@/shared/types";

interface UseUserFoodsReturn {
  foods: UserFoodEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addFood: (data: UserFoodFormData) => Promise<UserFoodEntry>;
  removeFood: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  markUsed: (id: string) => Promise<void>;
}

export function useUserFoods(): UseUserFoodsReturn {
  const [foods, setFoods] = useState<UserFoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserFoods();
      setFoods(response.foods);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载个人食物库失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addFood = useCallback(async (data: UserFoodFormData) => {
    const response = await createUserFood(data);
    setFoods((current) => [response.food, ...current]);
    return response.food;
  }, []);

  const removeFood = useCallback(async (id: string) => {
    await deleteUserFood(id);
    setFoods((current) => current.filter((food) => food.id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    const response = await updateUserFood(id, { isFavorite });
    setFoods((current) => current.map((food) => (food.id === id ? response.food : food)));
  }, []);

  const markUsed = useCallback(async (id: string) => {
    try {
      const response = await markUserFoodUsed(id);
      setFoods((current) => current.map((food) => (food.id === id ? response.food : food)));
    } catch {
      // Usage counting is best-effort; ignore failures.
    }
  }, []);

  return { foods, loading, error, reload, addFood, removeFood, toggleFavorite, markUsed };
}
