"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchFoodLogsByDate, createFoodLog, deleteFoodLog, updateFoodLog } from "@/lib/api/food-logs";
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载失败";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [load, enabled]);

  const addLog = useCallback(
    async (data: FoodLogFormData) => {
      try {
        await createFoodLog(date, data);
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : "保存失败";
        throw new Error(message);
      }
    },
    [date, load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      try {
        await deleteFoodLog(id);
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : "删除失败";
        throw new Error(message);
      }
    },
    [load],
  );

  const updateLog = useCallback(
    async (id: string, data: FoodLogFormData) => {
      try {
        await updateFoodLog(id, date, data);
        await load();
      } catch (err) {
        const message = err instanceof Error ? err.message : "更新失败";
        throw new Error(message);
      }
    },
    [date, load],
  );

  return { data, loading, error, reload: load, addLog, updateLog, removeLog };
}
