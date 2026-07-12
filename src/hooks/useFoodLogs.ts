"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchFoodLogsByDate, createFoodLog, deleteFoodLog } from "@/lib/api/food-logs";
import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

interface UseFoodLogsOptions {
  date: string;
  enabled?: boolean;
}

interface UseFoodLogsReturn {
  logs: FoodLogEntry[];
  loading: boolean;
  error: string | null;
  addLog: (data: FoodLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useFoodLogs({ date, enabled = true }: UseFoodLogsOptions): UseFoodLogsReturn {
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFoodLogsByDate(date);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载失败";
      setError(message);
      setLogs([]);
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

  return { logs, loading, error, addLog, removeLog, reload: load };
}
