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
  logs: ExerciseLogEntry[];
  loading: boolean;
  error: string | null;
  addLog: (data: ExerciseLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useExerciseLogs({
  startDate,
  endDate,
  enabled = true,
}: UseExerciseLogsOptions): UseExerciseLogsReturn {
  const [logs, setLogs] = useState<ExerciseLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExerciseLogs(startDate, endDate);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载运动记录失败";
      setError(message);
      setLogs([]);
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

  return { logs, loading, error, addLog, removeLog, reload: load };
}
