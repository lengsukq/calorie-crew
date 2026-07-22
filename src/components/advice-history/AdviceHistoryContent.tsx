"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { useAiAdviceHistory } from "@/hooks/useAiAdviceHistory";
import type { AiAdviceType } from "@/lib/db/schema";
import type { AiAdviceData } from "@/shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const { data, loading, error, reload, reactivate } = useAiAdviceHistory(typeParam);

  const feedbackStats = useMemo(() => {
    if (data.length === 0) return null;
    const helpful = data.filter((advice) => advice.feedback === "helpful").length;
    const percentage = Math.round((helpful / data.length) * 100);
    return { helpful, total: data.length, percentage };
  }, [data]);

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
          <Link href="/progress" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            ← 返回进度
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">AI 建议历史</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => void reload()}>
          <RefreshCw className="mr-1 h-3 w-3" />
          刷新
        </Button>
      </div>

      {feedbackStats && (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-semibold text-foreground">反馈统计</p>
            <p className="mt-1 text-xs text-muted-foreground">
              你共收到 {feedbackStats.total} 条建议，其中 {feedbackStats.helpful} 条被标记为有用
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-success transition-[width] duration-500 ease-out"
                style={{ width: `${feedbackStats.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-center text-lg font-bold text-success">{feedbackStats.percentage}%</p>
            <p className="text-center text-[10px] text-muted-foreground">有用率</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedType(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedType === option.value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-3xl opacity-50">📝</span>
              <p className="text-sm text-muted-foreground">暂无建议历史</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((advice) => {
            const expired = isExpired(advice);
            return (
              <Card key={advice.id}>
                <CardContent className="pt-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">{TYPE_LABELS[advice.type]}</Badge>
                      {advice.completedAt && <Badge variant="success">已完成</Badge>}
                      {advice.dismissed && (
                        <Badge variant="secondary" className="text-muted-foreground">
                          已屏蔽
                        </Badge>
                      )}
                      {expired && !advice.dismissed && <Badge variant="warning">已过期</Badge>}
                      {advice.feedback && (
                        <Badge variant={advice.feedback === "helpful" ? "success" : "danger"}>
                          {advice.feedback === "helpful" ? "有用" : "无用"}
                        </Badge>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatDateTime(advice.generatedAt)}
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-foreground">{advice.summary}</p>

                  <div className="mt-3 space-y-2">
                    {advice.suggestions.map((suggestion, index) => (
                      <div key={`${suggestion.title}-${index}`} className="rounded-xl bg-muted/60 p-3">
                        <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{suggestion.detail}</p>
                      </div>
                    ))}
                  </div>

                  {expired && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => void handleReactivate(advice)}>
                        重新激活
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        AI 建议仅供一般健康信息参考，不能替代专业医疗诊断或治疗。
      </p>
    </div>
  );
}
