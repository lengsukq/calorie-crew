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
  data: WeightLogEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveLog: (data: WeightLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export function useWeightLogs({
  startDate,
  endDate,
  enabled = true,
}: UseWeightLogsOptions): UseWeightLogsReturn {
  const [data, setData] = useState<WeightLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeightLogs(startDate, endDate);
      setData(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载体重记录失败";
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

  return { data, loading, error, reload: load, saveLog, removeLog };
}
