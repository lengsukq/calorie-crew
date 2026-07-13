"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTodayData } from "@/lib/api/dashboard";
import type { FoodLogEntry, DailySummary } from "@/shared/types";

interface UseSummaryOptions {
  date: string;
  enabled?: boolean;
}

interface SummaryData {
  logs: FoodLogEntry[];
  summary: DailySummary | null;
}

interface UseSummaryReturn {
  data: SummaryData | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useSummary({ date, enabled = true }: UseSummaryOptions): UseSummaryReturn {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTodayData(date);
      setData({ logs: result.logs, summary: result.summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载失败";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [load, enabled]);

  return { data, loading, error, reload: load };
}
