"use client";

import { useCallback, useState } from "react";
import { updateCalorieTarget, updateUserWeightTarget } from "@/lib/api/users";

interface UseUserTargetReturn {
  updating: boolean;
  error: string | null;
  updateTarget: (target: number) => Promise<boolean>;
  updateWeightTarget: (target: number | null) => Promise<boolean>;
}

export function useUserTarget(): UseUserTargetReturn {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTarget = useCallback(async (target: number): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      await updateCalorieTarget(target);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "更新失败";
      setError(message);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateWeightTarget = useCallback(async (target: number | null): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      await updateUserWeightTarget(target);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "更新失败";
      setError(message);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updating, error, updateTarget, updateWeightTarget };
}
