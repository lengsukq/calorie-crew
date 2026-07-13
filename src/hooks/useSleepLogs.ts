"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteSleepLog, fetchSleepLogs, upsertSleepLog } from "@/lib/api/health-logs";
import type { SleepLogEntry, SleepLogFormData } from "@/shared/types";

interface UseSleepLogsOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

interface UseSleepLogsReturn {
  logs: SleepLogEntry[];
  loading: boolean;
  error: string | null;
  saveLog: (data: SleepLogFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSleepLogs({
  startDate,
  endDate,
  enabled = true,
}: UseSleepLogsOptions): UseSleepLogsReturn {
  const [logs, setLogs] = useState<SleepLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSleepLogs(startDate, endDate);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载睡眠记录失败";
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
    async (data: SleepLogFormData) => {
      await upsertSleepLog(data.logDate, data.sleepMinutes, data.quality, data.note);
      await load();
    },
    [load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteSleepLog(id);
      await load();
    },
    [load],
  );

  return { logs, loading, error, saveLog, removeLog, reload: load };
}