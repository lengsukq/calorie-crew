"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAiAdviceHistory, reactivateAiAdvice } from "@/lib/api/ai-advice";
import type { AiAdviceType } from "@/lib/db/schema";
import type { AiAdviceData } from "@/shared/types";

interface UseAiAdviceHistoryReturn {
  data: AiAdviceData[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  reactivate: (id: string) => Promise<void>;
}

export function useAiAdviceHistory(type?: AiAdviceType, range: "7d" | "30d" | "90d" = "90d"): UseAiAdviceHistoryReturn {
  const [data, setData] = useState<AiAdviceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAiAdviceHistory(type, range);
      setData(response.advices);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载 AI 建议历史失败";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [range, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const reactivate = useCallback(async (id: string) => {
    const response = await reactivateAiAdvice(id);
    setData((current) =>
      current.map((advice) => (advice.id === id ? response.advice : advice)),
    );
  }, []);

  return { data, loading, error, reload: load, reactivate };
}
