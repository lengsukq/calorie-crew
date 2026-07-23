"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchEngagement } from "@/lib/api/engagement";
import type { EngagementData } from "@/shared/types";

interface UseEngagementReturn {
  data: EngagementData | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useEngagement(): UseEngagementReturn {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const engagement = await fetchEngagement();
      setData(engagement);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载成就数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
