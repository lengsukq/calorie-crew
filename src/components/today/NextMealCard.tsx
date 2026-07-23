"use client";

import { Loader2, RefreshCw, UtensilsCrossed } from "lucide-react";
import { useNextMeal } from "@/hooks/useNextMeal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

export function NextMealCard() {
  const { data, loading, error, generate } = useNextMeal();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">下一餐推荐</CardTitle>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => void generate()}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {data ? "换一批" : "生成推荐"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : data ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">剩余 {data.remainingKcal} kcal</Badge>
              <Badge variant="secondary">蛋白缺口 {data.proteinGap}g</Badge>
              <Badge variant="secondary">碳水缺口 {data.carbsGap}g</Badge>
              <Badge variant="secondary">脂肪缺口 {data.fatGap}g</Badge>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">{data.summary}</p>
            {data.suggestions.map((suggestion, index) => (
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
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              AI 建议仅供一般健康信息参考，不能替代专业医疗诊断或治疗。
            </p>
          </div>
        ) : (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            {error ?? "根据今日剩余热量与宏量缺口，为你推荐合适的下一餐搭配。"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
