"use client";

import { useCallback, useEffect, useState } from "react";

export interface DateRangeLogHookOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

export interface DateRangeLogHookReturn<TEntry, TFormData> {
  data: TEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveLog: (data: TFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

interface CreateDateRangeLogHookConfig<TEntry, TFormData> {
  loadErrorMessage: string;
  saveErrorMessage: string;
  removeErrorMessage: string;
  fetchLogs: (startDate: string, endDate: string) => Promise<{ logs: TEntry[] }>;
  saveLog: (data: TFormData) => Promise<unknown>;
  removeLog: (id: string) => Promise<unknown>;
}

function toErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function createDateRangeLogHook<TEntry, TFormData>(
  config: CreateDateRangeLogHookConfig<TEntry, TFormData>,
) {
  return function useDateRangeLogs({
    startDate,
    endDate,
    enabled = true,
  }: DateRangeLogHookOptions): DateRangeLogHookReturn<TEntry, TFormData> {
    const [data, setData] = useState<TEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await config.fetchLogs(startDate, endDate);
        setData(result.logs);
      } catch (loadError) {
        setError(toErrorMessage(loadError, config.loadErrorMessage));
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
      async (formData: TFormData) => {
        try {
          await config.saveLog(formData);
          await load();
        } catch (saveError) {
          throw new Error(toErrorMessage(saveError, config.saveErrorMessage));
        }
      },
      [load],
    );

    const removeLog = useCallback(
      async (id: string) => {
        try {
          await config.removeLog(id);
          await load();
        } catch (removeError) {
          throw new Error(toErrorMessage(removeError, config.removeErrorMessage));
        }
      },
      [load],
    );

    return { data, loading, error, reload: load, saveLog, removeLog };
  };
}
