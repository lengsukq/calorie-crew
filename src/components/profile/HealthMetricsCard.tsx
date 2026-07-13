"use client";

import { HeartPulse } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BMI_COLOR_CLASSES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
} as const;

export function HealthMetricsCard() {
  const { data, loading, error, reload } = useProfile();
  const metrics = data?.metrics ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">健康指标</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void reload()}>
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-16 w-full" />}
        {error && <p role="alert" className="mb-3 text-xs text-destructive">{error}</p>}
        {!loading && metrics && metrics.bmi !== null ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricBox label="BMI" value={metrics.bmi.toFixed(1)} badge={metrics.bmiCategory} color={metrics.bmiCategoryColor} />
            <MetricBox label="BMR" value={String(metrics.bmr)} unit="kcal" />
            <MetricBox label="TDEE" value={String(metrics.tdee)} unit="kcal" />
            <MetricBox
              label="建议摄入"
              value={metrics.suggestedIntake ? `${metrics.suggestedIntake.min}-${metrics.suggestedIntake.max}` : "--"}
              unit="kcal"
            />
          </div>
        ) : (
          !loading && (
            <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
              请完善出生日期、身高，并记录一次体重以查看 BMI、BMR 与 TDEE。
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  unit?: string;
  badge?: string | null;
  color?: keyof typeof BMI_COLOR_CLASSES | null;
}

function MetricBox({ label, value, unit, badge, color }: MetricBoxProps) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      {badge && color && (
        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${BMI_COLOR_CLASSES[color]}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
