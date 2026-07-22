"use client";

import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { TrackerCard } from "@/components/shared/TrackerCard";
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
  const [weightKg, setWeightKg] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (todayWeightLog && !syncedRef.current) {
      setWeightKg(Number(todayWeightLog.weightKg));
      setNote(todayWeightLog.note ?? "");
      syncedRef.current = true;
    }
  }, [todayWeightLog]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (weightKg < 20 || weightKg > 500) {
      return;
    }

    setSaving(true);
    try {
      const payload: WeightLogFormData = { logDate: currentDate, weightKg, note };
      await saveLog(payload);
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

  const value = todayWeightLog ? `${Number(todayWeightLog.weightKg).toFixed(1)} kg` : undefined;
  const hint = weightTargetKg
    ? targetDifference === null
      ? `目标 ${Number(weightTargetKg).toFixed(1)} kg`
      : `目标 ${Number(weightTargetKg).toFixed(1)} kg · 差 ${targetDifference > 0 ? "+" : ""}${targetDifference.toFixed(1)}`
    : "尚未设置体重目标";

  return (
    <TrackerCard icon={Scale} title="今日体重" value={value} hint={hint}>
      <div className="space-y-3">
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
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
            <Button type="submit" size="sm" disabled={saving} className="w-full">
              {saving ? "保存中..." : todayWeightLog ? "更新体重" : "记录体重"}
            </Button>
          </form>
        )}
      </div>
    </TrackerCard>
  );
}
