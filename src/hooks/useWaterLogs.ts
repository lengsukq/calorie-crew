"use client";

import { useCallback, useEffect, useState } from "react";
import { createWaterLog, deleteWaterLog, fetchWaterLogs } from "@/lib/api/health-logs";
import type { WaterLogEntry, WaterLogFormData } from "@/shared/types";

interface UseWaterLogsOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

interface UseWaterLogsReturn {
  logs: WaterLogEntry[];
  loading: boolean;
  error: string | null;
  addLog: (data: WaterLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useWaterLogs({
  startDate,
  endDate,
  enabled = true,
}: UseWaterLogsOptions): UseWaterLogsReturn {
  const [logs, setLogs] = useState<WaterLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWaterLogs(startDate, endDate);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载饮水记录失败";
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
    async (data: WaterLogFormData) => {
      await createWaterLog(data.logDate, data.amountMl, data.note);
      await load();
    },
    [load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteWaterLog(id);
      await load();
    },
    [load],
  );

  return { logs, loading, error, addLog, removeLog, reload: load };
}