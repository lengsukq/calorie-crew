"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAiAdviceHistory } from "@/hooks/useAiAdviceHistory";
import type { AiAdviceType } from "@/lib/db/schema";
import type { AiAdviceData } from "@/shared/types";

const TYPE_LABELS: Record<AiAdviceType, string> = {
  daily_diet: "每日饮食",
  weekly_summary: "每周总结",
  bmi_alert: "BMI 提示",
  goal_reminder: "目标提醒",
};

const TYPE_OPTIONS: Array<{ value: AiAdviceType | "all"; label: string }> = [
  { value: "all", label: "全部" },
  { value: "daily_diet", label: "每日饮食" },
  { value: "weekly_summary", label: "每周总结" },
  { value: "bmi_alert", label: "BMI 提示" },
  { value: "goal_reminder", label: "目标提醒" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(advice: AiAdviceData): boolean {
  return new Date(advice.expiresAt) < new Date();
}

export function AdviceHistoryContent() {
  const [selectedType, setSelectedType] = useState<AiAdviceType | "all">("all");
  const typeParam = selectedType === "all" ? undefined : selectedType;
  const { advices, loading, error, reload, reactivate } = useAiAdviceHistory(typeParam);

  const feedbackStats = useMemo(() => {
    if (advices.length === 0) return null;
    const helpful = advices.filter((advice) => advice.feedback === "helpful").length;
    const percentage = Math.round((helpful / advices.length) * 100);
    return { helpful, total: advices.length, percentage };
  }, [advices]);

  async function handleReactivate(advice: AiAdviceData) {
    try {
      await reactivate(advice.id);
      toast.success("建议已重新激活，有效期已延长");
    } catch (err) {
      const message = err instanceof Error ? err.message : "重新激活失败";
      toast.error(message);
    }
  }

  return (
    <div className="stack page-enter">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/progress" className="text-xs text-slate-400 hover:text-slate-600">
            ← 返回进度
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-800">AI 建议历史</h1>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white"
        >
          刷新
        </button>
      </div>

      {feedbackStats && (
        <div className="glass-card">
          <p className="text-sm font-semibold text-slate-700">反馈统计</p>
          <p className="mt-1 text-xs text-slate-400">
            你共收到 {feedbackStats.total} 条建议，其中 {feedbackStats.helpful} 条被标记为有用
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
              style={{ width: `${feedbackStats.percentage}%` }}
            />
          </div>
          <p className="mt-2 text-center text-lg font-bold text-emerald-600">{feedbackStats.percentage}%</p>
          <p className="text-center text-[10px] text-slate-400">有用率</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedType(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedType === option.value
                ? "bg-cyan-100 text-cyan-700"
                : "bg-white/70 text-slate-500 hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-message-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card flex items-center justify-center py-8">
          <span className="y2k-spinner h-6 w-6" />
        </div>
      ) : advices.length === 0 ? (
        <div className="glass-card">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-3xl opacity-50">📝</span>
            <p className="text-sm text-slate-400">暂无建议历史</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {advices.map((advice) => {
            const expired = isExpired(advice);
            return (
              <div key={advice.id} className="glass-card">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-600">
                      {TYPE_LABELS[advice.type]}
                    </span>
                    {advice.completedAt && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        已完成
                      </span>
                    )}
                    {advice.dismissed && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        已屏蔽
                      </span>
                    )}
                    {expired && !advice.dismissed && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        已过期
                      </span>
                    )}
                    {advice.feedback && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          advice.feedback === "helpful"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {advice.feedback === "helpful" ? "有用" : "无用"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDateTime(advice.generatedAt)}</span>
                </div>

                <p className="text-sm font-medium leading-relaxed text-slate-700">{advice.summary}</p>

                <div className="mt-3 space-y-2">
                  {advice.suggestions.map((suggestion, index) => (
                    <div key={`${suggestion.title}-${index}`} className="rounded-xl bg-white/60 p-3">
                      <p className="text-sm font-semibold text-slate-700">{suggestion.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{suggestion.detail}</p>
                    </div>
                  ))}
                </div>

                {expired && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleReactivate(advice)}
                      className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
                    >
                      重新激活
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-slate-400">
        AI 建议仅供一般健康信息参考，不能替代专业医疗诊断或治疗。
      </p>
    </div>
  );
}
