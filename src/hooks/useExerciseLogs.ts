"use client";

import { useCallback, useEffect, useState } from "react";
import { createExerciseLog, deleteExerciseLog, fetchExerciseLogs } from "@/lib/api/health-logs";
import type { ExerciseLogEntry, ExerciseLogFormData } from "@/shared/types";

interface UseExerciseLogsOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

interface UseExerciseLogsReturn {
  data: ExerciseLogEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addLog: (data: ExerciseLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export function useExerciseLogs({
  startDate,
  endDate,
  enabled = true,
}: UseExerciseLogsOptions): UseExerciseLogsReturn {
  const [data, setData] = useState<ExerciseLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExerciseLogs(startDate, endDate);
      setData(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载运动记录失败";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [enabled, load]);

  const addLog = useCallback(
    async (data: ExerciseLogFormData) => {
      await createExerciseLog(data);
      await load();
    },
    [load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteExerciseLog(id);
      await load();
    },
    [load],
  );

  return { data, loading, error, reload: load, addLog, removeLog };
}
