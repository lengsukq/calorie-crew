"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteAiAdvice, fetchAiAdvices, generateAiAdvice } from "@/lib/api/ai-advice";
import type { AiAdviceType } from "@/lib/db/schema";
import type { AiAdviceData } from "@/shared/types";

interface UseAiAdviceOptions {
  type?: AiAdviceType;
  range?: "7d" | "30d" | "90d";
  enabled?: boolean;
}

interface UseAiAdviceReturn {
  advices: AiAdviceData[];
  latestAdvice: AiAdviceData | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  reload: () => Promise<void>;
  generate: (force?: boolean) => Promise<AiAdviceData>;
  remove: (id: string) => Promise<void>;
}

export function useAiAdvice({
  type,
  range = "7d",
  enabled = true,
}: UseAiAdviceOptions): UseAiAdviceReturn {
  const [advices, setAdvices] = useState<AiAdviceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAiAdvices(type, range);
      setAdvices(response.advices);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载 AI 建议失败";
      setError(message);
      setAdvices([]);
    } finally {
      setLoading(false);
    }
  }, [range, type]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [enabled, load]);

  const generate = useCallback(async (force = false) => {
    if (!type) throw new Error("缺少建议类型");

    setGenerating(true);
    setError(null);
    try {
      const advice = await generateAiAdvice(type, force);
      setAdvices((currentAdvices) => [advice, ...currentAdvices.filter((item) => item.id !== advice.id)]);
      return advice;
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成 AI 建议失败";
      setError(message);
      throw new Error(message);
    } finally {
      setGenerating(false);
    }
  }, [type]);

  const remove = useCallback(async (id: string) => {
    await deleteAiAdvice(id);
    setAdvices((currentAdvices) => currentAdvices.filter((advice) => advice.id !== id));
  }, []);

  return {
    advices,
    latestAdvice: advices[0] ?? null,
    loading,
    generating,
    error,
    reload: load,
    generate,
    remove,
  };
}
