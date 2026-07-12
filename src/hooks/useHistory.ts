"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchHistory } from "@/lib/api/dashboard";
import type { HistoryDay } from "@/shared/types";

interface UseHistoryReturn {
  data: HistoryDay[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useHistory(days: number): UseHistoryReturn {
  const [data, setData] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHistory(days);
      setData(result.summaries);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载失败";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
