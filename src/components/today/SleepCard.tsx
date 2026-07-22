"use client";

import { Moon } from "lucide-react";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useResourceForm } from "@/hooks/useResourceForm";
import { TrackerCard } from "@/components/shared/TrackerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { SleepLogFormData } from "@/shared/types";

interface SleepCardProps {
  currentDate: string;
}

export function SleepCard({ currentDate }: SleepCardProps) {
  const { data: logs, loading, error, saveLog } = useSleepLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const todaySleepLog = logs[0] ?? null;

  const form = useResourceForm<SleepLogFormData>({
    defaultValue: {
      logDate: currentDate,
      sleepMinutes: todaySleepLog ? todaySleepLog.sleepMinutes : 420,
      quality: todaySleepLog ? todaySleepLog.quality : 3,
      note: todaySleepLog?.note ?? "",
    },
    onSubmit: async (values) => saveLog({ ...values, logDate: currentDate }),
    successMessage: "睡眠记录已保存",
    errorMessage: "保存睡眠失败",
  });

  const hours = Math.floor(form.values.sleepMinutes / 60);
  const minutes = form.values.sleepMinutes % 60;

  return (
    <TrackerCard
      icon={Moon}
      title="昨晚睡眠"
      value={todaySleepLog ? `${hours}h ${minutes}m` : undefined}
      hint={todaySleepLog ? `质量 ${form.values.quality}/5` : "还没有睡眠记录"}
    >
      <div className="space-y-3">
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor={`sleep-minutes-${currentDate}`}>睡眠时长 (分钟)</Label>
            <Input
              id={`sleep-minutes-${currentDate}`}
              type="number"
              min="0"
              max="1440"
              value={form.values.sleepMinutes}
              onChange={(e) => form.setValues((prev) => ({ ...prev, sleepMinutes: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`sleep-quality-${currentDate}`}>睡眠质量 (1-5)</Label>
            <Input
              id={`sleep-quality-${currentDate}`}
              type="number"
              min="1"
              max="5"
              value={form.values.quality}
              onChange={(e) => form.setValues((prev) => ({ ...prev, quality: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`sleep-note-${currentDate}`}>备注</Label>
            <Input
              id={`sleep-note-${currentDate}`}
              type="text"
              maxLength={300}
              value={form.values.note ?? ""}
              onChange={(e) => form.setValues((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="例如：睡前喝了咖啡"
            />
          </div>
          <Button type="submit" size="sm" disabled={form.submitting} className="w-full">
            {form.submitting ? "保存中..." : "保存睡眠"}
          </Button>
        </form>
        )}
      </div>
    </TrackerCard>
  );
}
