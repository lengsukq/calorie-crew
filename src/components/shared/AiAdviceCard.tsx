"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAiAdvice } from "@/hooks/useAiAdvice";
import type { AiAdviceType } from "@/lib/db/schema";
import { runWithToast } from "@/lib/ui/with-toast-action";
import type { AiAdviceData } from "@/shared/types";

const PRIORITY_LABELS = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
} as const;

const PRIORITY_CLASSES = {
  high: "bg-red-50 text-red-500",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-emerald-50 text-emerald-600",
} as const;

interface AiAdviceCardProps {
  title: string;
  type: AiAdviceType;
  icon?: string;
  emptyText?: string;
  disabledText?: string;
  enabled?: boolean;
  autoGenerate?: boolean;
}

export function AiAdviceCard({
  title,
  type,
  icon = "✨",
  emptyText = "暂无建议，记录更多数据后再来生成吧。",
  disabledText = "AI 建议已关闭，可在个人资料中开启。",
  enabled = true,
  autoGenerate = false,
}: AiAdviceCardProps) {
  const { data: adviceData, loading, generating, error, generate, complete, dismiss, feedback, reload } = useAiAdvice({ type, enabled });
  const [expanded, setExpanded] = useState(false);
  const displayAdvice = adviceData.latestAdvice;

  async function handleGenerate(force: boolean) {
    try {
      await generate(force);
      setExpanded(true);
      toast.success(force ? "AI 建议已刷新" : "AI 建议已生成");
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成 AI 建议失败";
      toast.error(message);
    }
  }

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void reload()} className="text-xs text-slate-400 hover:text-slate-600">
            刷新列表
          </button>
          <button
            type="button"
            disabled={!enabled || generating}
            onClick={() => void handleGenerate(Boolean(displayAdvice) || autoGenerate)}
            className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "生成中..." : displayAdvice ? "刷新建议" : "生成建议"}
          </button>
        </div>
      </div>

      {!enabled ? (
        <div className="rounded-2xl bg-white/50 px-4 py-5 text-center text-sm text-slate-400">{disabledText}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-5">
          <span className="y2k-spinner h-5 w-5" />
        </div>
      ) : displayAdvice ? (
        <AdviceContent
          advice={displayAdvice}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          onComplete={complete}
          onDismiss={dismiss}
          onFeedback={feedback}
        />
      ) : (
        <div className="rounded-2xl bg-white/50 px-4 py-5 text-center text-sm text-slate-400">
          {error ?? emptyText}
        </div>
      )}
    </div>
  );
}

interface AdviceContentProps {
  advice: AiAdviceData;
  expanded: boolean;
  onToggle: () => void;
  onComplete: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  onFeedback: (id: string, value: "helpful" | "not_helpful") => Promise<void>;
}

function AdviceContent({ advice, expanded, onToggle, onComplete, onDismiss, onFeedback }: AdviceContentProps) {
  const [feedbackValue, setFeedbackValue] = useState<"helpful" | "not_helpful" | null>(advice.feedback ?? null);
  const [completed, setCompleted] = useState(advice.completedAt !== null);
  const [dismissed, setDismissed] = useState(advice.dismissed);

  async function handleFeedback(value: "helpful" | "not_helpful") {
    const succeeded = await runWithToast(
      () => onFeedback(advice.id, value),
      { success: "感谢反馈，我们会优化后续建议", failure: "反馈失败" },
    );
    if (succeeded) setFeedbackValue(value);
  }

  async function handleComplete() {
    const succeeded = await runWithToast(
      () => onComplete(advice.id),
      { success: "已标记为完成", failure: "标记完成失败" },
    );
    if (succeeded) setCompleted(true);
  }

  async function handleDismiss() {
    const succeeded = await runWithToast(
      () => onDismiss(advice.id),
      { success: "建议已屏蔽", failure: "屏蔽失败" },
    );
    if (succeeded) setDismissed(true);
  }

  if (dismissed) {
    return (
      <div className="rounded-2xl bg-white/55 p-4">
        <p className="text-sm text-slate-400">该建议已被屏蔽，不再展示。</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/55 p-4">
      <p className="text-sm font-medium leading-relaxed text-slate-700">{advice.summary}</p>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span>{new Date(advice.generatedAt).toLocaleString("zh-CN")}</span>
        <button type="button" onClick={onToggle} className="font-semibold text-cyan-500 hover:text-cyan-600">
          {expanded ? "收起详情" : "查看详情"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {advice.suggestions.map((suggestion, index) => (
            <div key={`${suggestion.title}-${index}`} className="rounded-xl bg-white/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">{suggestion.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CLASSES[suggestion.priority]}`}>
                  {PRIORITY_LABELS[suggestion.priority]}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{suggestion.detail}</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleFeedback("helpful")}
              disabled={feedbackValue === "helpful"}
              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              有用
            </button>
            <button
              type="button"
              onClick={() => void handleFeedback("not_helpful")}
              disabled={feedbackValue === "not_helpful"}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              无用
            </button>
            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={completed}
              className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completed ? "已完成" : "标记完成"}
            </button>
            <button
              type="button"
              onClick={() => void handleDismiss()}
              disabled={dismissed}
              className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              屏蔽
            </button>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            AI 建议仅供一般健康信息参考，不能替代专业医疗诊断或治疗。
          </p>
        </div>
      )}
    </div>
  );
}
