"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFoodLog,
  deleteFoodLog,
  fetchFoodLogsByDate,
  updateFoodLog,
} from "@/lib/api/food-logs";
import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

interface UseFoodLogsOptions {
  date: string;
  enabled?: boolean;
}

interface UseFoodLogsReturn {
  data: FoodLogEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addLog: (data: FoodLogFormData) => Promise<void>;
  updateLog: (id: string, data: FoodLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

function toErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useFoodLogs({ date, enabled = true }: UseFoodLogsOptions): UseFoodLogsReturn {
  const [data, setData] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFoodLogsByDate(date);
      setData(result.logs);
    } catch (loadError) {
      setError(toErrorMessage(loadError, "加载失败"));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [enabled, load]);

  const addLog = useCallback(
    async (formData: FoodLogFormData) => {
      try {
        await createFoodLog(date, formData);
        await load();
      } catch (saveError) {
        throw new Error(toErrorMessage(saveError, "保存失败"));
      }
    },
    [date, load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      try {
        await deleteFoodLog(id);
        await load();
      } catch (removeError) {
        throw new Error(toErrorMessage(removeError, "删除失败"));
      }
    },
    [load],
  );

  const updateLog = useCallback(
    async (id: string, formData: FoodLogFormData) => {
      try {
        await updateFoodLog(id, date, formData);
        await load();
      } catch (updateError) {
        throw new Error(toErrorMessage(updateError, "更新失败"));
      }
    },
    [date, load],
  );

  return { data, loading, error, reload: load, addLog, updateLog, removeLog };
}
