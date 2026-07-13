"use client";

import { useCallback, useEffect, useState } from "react";
import {
  batchActionFoodLogs,
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
  batchDelete: (ids: string[]) => Promise<void>;
  batchCopy: (ids: string[], targetDate: string) => Promise<void>;
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
      const snapshot = data;
      setData((prev) => prev.filter((log) => log.id !== id));
      try {
        await deleteFoodLog(id);
        await load();
      } catch (removeError) {
        setData(snapshot);
        throw new Error(toErrorMessage(removeError, "删除失败"));
      }
    },
    [data, load],
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

  const batchDelete = useCallback(
    async (ids: string[]) => {
      await batchActionFoodLogs("delete", ids);
      await load();
    },
    [load],
  );

  const batchCopy = useCallback(
    async (ids: string[], targetDate: string) => {
      await batchActionFoodLogs("copy", ids, targetDate);
      await load();
    },
    [load],
  );

  return { data, loading, error, reload: load, addLog, updateLog, removeLog, batchDelete, batchCopy };
}
