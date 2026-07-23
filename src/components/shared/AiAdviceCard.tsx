"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { RefreshCw, Loader2, Sparkles, History, type LucideIcon } from "lucide-react";
import { useAiAdvice } from "@/hooks/useAiAdvice";
import type { AiAdviceType } from "@/lib/db/schema";
import { runWithToast } from "@/lib/ui/with-toast-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiAdviceData } from "@/shared/types";

const PRIORITY_LABELS = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
} as const;

const PRIORITY_VARIANTS = {
  high: "destructive" as const,
  medium: "warning" as const,
  low: "success" as const,
};

interface AiAdviceCardProps {
  title: string;
  type: AiAdviceType;
  icon?: LucideIcon;
  emptyText?: string;
  disabledText?: string;
  enabled?: boolean;
  autoGenerate?: boolean;
}

export function AiAdviceCard({
  title,
  type,
  icon: Icon = Sparkles,
  emptyText = "暂无建议，记录更多数据后再来生成吧。",
  disabledText = "AI 建议已关闭，可在个人资料中开启。",
  enabled = true,
  autoGenerate = false,
}: AiAdviceCardProps) {
  const { data: adviceData, loading, generating, error, generate, complete, dismiss, feedback, reload } = useAiAdvice({ type, enabled, autoGenerate });
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/advice-history"
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="查看 AI 建议历史"
          >
            <History className="h-3.5 w-3.5" />
            历史
          </Link>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void reload()}>
            刷新列表
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!enabled || generating}
            onClick={() => void handleGenerate(Boolean(displayAdvice) || autoGenerate)}
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {generating ? "生成中" : displayAdvice ? "刷新" : "生成"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!enabled ? (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            {disabledText}
          </p>
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            {error ?? emptyText}
          </p>
        )}
      </CardContent>
    </Card>
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
      <p className="text-sm text-muted-foreground">该建议已被屏蔽，不再展示。</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium leading-relaxed text-foreground">{advice.summary}</p>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{new Date(advice.generatedAt).toLocaleString("zh-CN")}</span>
        <button type="button" onClick={onToggle} className="font-medium text-primary hover:underline">
          {expanded ? "收起详情" : "查看详情"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {advice.suggestions.map((suggestion, index) => (
            <div key={`${suggestion.title}-${index}`} className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                <Badge variant={PRIORITY_VARIANTS[suggestion.priority]}>
                  {PRIORITY_LABELS[suggestion.priority]}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{suggestion.detail}</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleFeedback("helpful")}
              disabled={feedbackValue === "helpful"}
            >
              有用
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleFeedback("not_helpful")}
              disabled={feedbackValue === "not_helpful"}
            >
              无用
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleComplete()}
              disabled={completed}
            >
              {completed ? "已完成" : "标记完成"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleDismiss()}
              disabled={dismissed}
              className="text-muted-foreground"
            >
              屏蔽
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            AI 建议仅供一般健康信息参考，不能替代专业医疗诊断或治疗。
          </p>
        </div>
      )}
    </div>
  );
}
