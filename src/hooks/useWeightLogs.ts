"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteWeightLog, fetchWeightLogs, upsertWeightLog } from "@/lib/api/health-logs";
import type { WeightLogEntry, WeightLogFormData } from "@/shared/types";

interface UseWeightLogsOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

interface UseWeightLogsReturn {
  logs: WeightLogEntry[];
  loading: boolean;
  error: string | null;
  saveLog: (data: WeightLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useWeightLogs({
  startDate,
  endDate,
  enabled = true,
}: UseWeightLogsOptions): UseWeightLogsReturn {
  const [logs, setLogs] = useState<WeightLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeightLogs(startDate, endDate);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载体重记录失败";
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

  const saveLog = useCallback(
    async (data: WeightLogFormData) => {
      await upsertWeightLog(data);
      await load();
    },
    [load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteWeightLog(id);
      await load();
    },
    [load],
  );

  return { logs, loading, error, saveLog, removeLog, reload: load };
}
