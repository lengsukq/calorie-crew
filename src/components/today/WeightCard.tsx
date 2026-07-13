"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeightLogFormData } from "@/shared/types";

interface WeightCardProps {
  currentDate: string;
  weightTargetKg: string | null;
}

export function WeightCard({ currentDate, weightTargetKg }: WeightCardProps) {
  const { data: logs, loading, error, saveLog } = useWeightLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const todayWeightLog = logs[0] ?? null;
  const [isEditing, setIsEditing] = useState(false);
  const [weightKg, setWeightKg] = useState(todayWeightLog ? Number(todayWeightLog.weightKg) : 0);
  const [note, setNote] = useState(todayWeightLog?.note ?? "");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setWeightKg(todayWeightLog ? Number(todayWeightLog.weightKg) : 0);
    setNote(todayWeightLog?.note ?? "");
    setIsEditing(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (weightKg < 20 || weightKg > 500) {
      return;
    }

    setSaving(true);
    try {
      const payload: WeightLogFormData = { logDate: currentDate, weightKg, note };
      await saveLog(payload);
      setIsEditing(false);
    } catch {
      // hook 已处理错误展示
    } finally {
      setSaving(false);
    }
  }

  const targetDifference =
    todayWeightLog && weightTargetKg
      ? Number(todayWeightLog.weightKg) - Number(weightTargetKg)
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">今日体重</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={startEditing}>
          {todayWeightLog ? "更新" : "记录"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {weightTargetKg ? `目标 ${Number(weightTargetKg).toFixed(1)} kg` : "尚未设置体重目标"}
        </p>

        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : todayWeightLog ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">已记录</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {Number(todayWeightLog.weightKg).toFixed(1)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">目标差值</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                {targetDifference === null
                  ? "--"
                  : `${targetDifference > 0 ? "+" : ""}${targetDifference.toFixed(1)} kg`}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
            今天还没有记录体重
          </p>
        )}

        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-3">
            <div className="space-y-1.5">
              <Label htmlFor={`weight-kg-${currentDate}`}>体重 (kg)</Label>
              <Input
                id={`weight-kg-${currentDate}`}
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={weightKg || ""}
                onChange={(event) => setWeightKg(Number(event.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`weight-note-${currentDate}`}>备注</Label>
              <Input
                id={`weight-note-${currentDate}`}
                type="text"
                maxLength={300}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：晨起空腹"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
