"use client";

import { useCallback, useState } from "react";
import { fetchNextMealSuggestion } from "@/lib/api/ai-advice";
import type { NextMealSuggestion } from "@/shared/types";

interface UseNextMealReturn {
  data: NextMealSuggestion | null;
  loading: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

export function useNextMeal(): UseNextMealReturn {
  const [data, setData] = useState<NextMealSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const suggestion = await fetchNextMealSuggestion();
      setData(suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成下一餐建议失败");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, generate };
}
