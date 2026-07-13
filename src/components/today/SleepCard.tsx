"use client";

import { Moon } from "lucide-react";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useResourceForm } from "@/hooks/useResourceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">昨晚睡眠</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : todaySleepLog ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">时长</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {hours}
                <span className="ml-1 text-xs font-normal text-muted-foreground">时 {minutes} 分</span>
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">质量</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {form.values.quality}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/ 5</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
            记录昨晚睡眠，追踪睡眠趋势
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-3 border-t pt-3"
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
      </CardContent>
    </Card>
  );
}
