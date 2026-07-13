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
  data: WaterLogEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addLog: (data: WaterLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export function useWaterLogs({
  startDate,
  endDate,
  enabled = true,
}: UseWaterLogsOptions): UseWaterLogsReturn {
  const [data, setData] = useState<WaterLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWaterLogs(startDate, endDate);
      setData(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载饮水记录失败";
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

  return { data, loading, error, reload: load, addLog, removeLog };
}