"use client";

import { Droplets, Trash2 } from "lucide-react";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useResourceForm } from "@/hooks/useResourceForm";
import { TrackerCard } from "@/components/shared/TrackerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { WaterLogFormData } from "@/shared/types";

const WATER_SUGGESTIONS = [250, 500, 750];

interface WaterCardProps {
  currentDate: string;
}

export function WaterCard({ currentDate }: WaterCardProps) {
  const { data: logs, loading, error, addLog, removeLog } = useWaterLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

  const form = useResourceForm<WaterLogFormData>({
    defaultValue: { logDate: currentDate, amountMl: 500, note: "" },
    onSubmit: async (values) => {
      await addLog({ ...values, logDate: currentDate });
      form.setValues({ logDate: currentDate, amountMl: values.amountMl, note: "" });
    },
    successMessage: "饮水已记录",
    errorMessage: "保存饮水失败",
  });

  return (
    <TrackerCard
      icon={Droplets}
      title="今日饮水"
      value={`${totalMl} ml`}
      hint={logs.length > 0 ? `${logs.length} 次记录` : "还没有饮水记录"}
    >
      <div className="space-y-3">
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
          </div>
        ) : logs.length > 0 && (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground tabular-nums">{log.amountMl} ml</p>
                  <p className="truncate text-xs text-muted-foreground">{log.note || "无备注"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => void removeLog(log.id)}
                  aria-label="删除饮水记录"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-3"
        >
          <div className="flex flex-wrap gap-2">
            {WATER_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => form.setValues((prev) => ({ ...prev, amountMl: suggestion }))}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.values.amountMl === suggestion
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {suggestion} ml
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`water-amount-${currentDate}`}>饮水量 (ml)</Label>
            <Input
              id={`water-amount-${currentDate}`}
              type="number"
              min="1"
              max="10000"
              value={form.values.amountMl || ""}
              onChange={(e) => form.setValues((prev) => ({ ...prev, amountMl: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`water-note-${currentDate}`}>备注</Label>
            <Input
              id={`water-note-${currentDate}`}
              type="text"
              maxLength={300}
              value={form.values.note ?? ""}
              onChange={(e) => form.setValues((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="例如：晨起一杯水"
            />
          </div>
          <Button type="submit" disabled={form.submitting} className="w-full" size="sm">
            {form.submitting ? "保存中..." : "记录饮水"}
          </Button>
        </form>
      </div>
    </TrackerCard>
  );
}
