"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  completeAiAdvice,
  deleteAiAdvice,
  dismissAiAdvice,
  feedbackAiAdvice,
  fetchAiAdvices,
  generateAiAdvice,
  reactivateAiAdvice,
} from "@/lib/api/ai-advice";
import type { AiAdviceType } from "@/lib/db/schema";
import type { AiAdviceData } from "@/shared/types";

interface UseAiAdviceOptions {
  type?: AiAdviceType;
  range?: "7d" | "30d" | "90d";
  enabled?: boolean;
  autoGenerate?: boolean;
}

interface AiAdviceDataBundle {
  advices: AiAdviceData[];
  latestAdvice: AiAdviceData | null;
}

interface UseAiAdviceReturn {
  data: AiAdviceDataBundle;
  loading: boolean;
  generating: boolean;
  error: string | null;
  reload: () => Promise<void>;
  generate: (force?: boolean) => Promise<AiAdviceData>;
  remove: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  feedback: (id: string, value: "helpful" | "not_helpful") => Promise<void>;
  reactivate: (id: string) => Promise<void>;
}

function toErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

function replaceAdvice(advices: AiAdviceData[], nextAdvice: AiAdviceData): AiAdviceData[] {
  return [nextAdvice, ...advices.filter((advice) => advice.id !== nextAdvice.id)];
}

export function useAiAdvice({
  type,
  range = "7d",
  enabled = true,
  autoGenerate = false,
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
    } catch (loadError) {
      setError(toErrorMessage(loadError, "加载 AI 建议失败"));
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

  const generate = useCallback(
    async (force = false) => {
      if (!type) throw new Error("缺少建议类型");

      setGenerating(true);
      setError(null);
      try {
        const advice = await generateAiAdvice(type, force);
        setAdvices((currentAdvices) => replaceAdvice(currentAdvices, advice));
        return advice;
      } catch (generateError) {
        const message = toErrorMessage(generateError, "生成 AI 建议失败");
        setError(message);
        throw new Error(message);
      } finally {
        setGenerating(false);
      }
    },
    [type],
  );

  const autoGenerateTriggered = useRef(false);

  useEffect(() => {
    if (!autoGenerate || !enabled || !type || loading) return;
    if (autoGenerateTriggered.current) return;
    if (advices.length > 0) return;
    autoGenerateTriggered.current = true;
    void generate(false).catch(() => {
      /* 懒生成失败时静默处理，用户仍可手动触发 */
    });
  }, [autoGenerate, enabled, type, loading, advices.length, generate]);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteAiAdvice(id);
      setAdvices((currentAdvices) => currentAdvices.filter((advice) => advice.id !== id));
    } catch (removeError) {
      throw new Error(toErrorMessage(removeError, "删除 AI 建议失败"));
    }
  }, []);

  const complete = useCallback(async (id: string) => {
    try {
      await completeAiAdvice(id);
      setAdvices((currentAdvices) =>
        currentAdvices.map((advice) =>
          advice.id === id
            ? { ...advice, completedAt: advice.completedAt ?? new Date().toISOString() }
            : advice,
        ),
      );
    } catch (completeError) {
      throw new Error(toErrorMessage(completeError, "标记完成失败"));
    }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    try {
      await dismissAiAdvice(id);
      setAdvices((currentAdvices) =>
        currentAdvices.map((advice) =>
          advice.id === id
            ? {
                ...advice,
                dismissed: true,
                dismissedAt: advice.dismissedAt ?? new Date().toISOString(),
              }
            : advice,
        ),
      );
    } catch (dismissError) {
      throw new Error(toErrorMessage(dismissError, "屏蔽失败"));
    }
  }, []);

  const feedback = useCallback(async (id: string, value: "helpful" | "not_helpful") => {
    try {
      await feedbackAiAdvice(id, value);
      setAdvices((currentAdvices) =>
        currentAdvices.map((advice) =>
          advice.id === id
            ? {
                ...advice,
                feedback: value,
                feedbackAt: new Date().toISOString(),
              }
            : advice,
        ),
      );
    } catch (feedbackError) {
      throw new Error(toErrorMessage(feedbackError, "反馈失败"));
    }
  }, []);

  const reactivate = useCallback(async (id: string) => {
    try {
      const response = await reactivateAiAdvice(id);
      setAdvices((currentAdvices) => replaceAdvice(currentAdvices, response.advice));
    } catch (reactivateError) {
      throw new Error(toErrorMessage(reactivateError, "重新激活失败"));
    }
  }, []);

  return {
    data: {
      advices,
      latestAdvice: advices[0] ?? null,
    },
    loading,
    generating,
    error,
    reload: load,
    generate,
    remove,
    complete,
    dismiss,
    feedback,
    reactivate,
  };
}
