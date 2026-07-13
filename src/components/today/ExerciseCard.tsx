"use client";

import { useState } from "react";
import { Dumbbell, Trash2 } from "lucide-react";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseLogFormData } from "@/shared/types";

const EXERCISE_SUGGESTIONS = ["跑步", "快走", "骑行", "游泳", "力量训练", "瑜伽"];

interface ExerciseCardProps {
  currentDate: string;
  onChanged: () => Promise<void>;
}

export function ExerciseCard({ currentDate, onChanged }: ExerciseCardProps) {
  const { data: logs, loading, error, addLog, removeLog } = useExerciseLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [exerciseType, setExerciseType] = useState(EXERCISE_SUGGESTIONS[0]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState(200);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const totalExerciseKcal = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalDurationMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: ExerciseLogFormData = {
        logDate: currentDate,
        exerciseType,
        durationMinutes,
        caloriesBurned,
        note,
      };
      await addLog(payload);
      await onChanged();
      setIsAdding(false);
      setNote("");
    } catch {
      // hook 已处理错误展示
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeLog(id);
      await onChanged();
    } catch {
      // hook 已处理错误展示
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">今日运动</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          添加运动
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground tabular-nums">
          已消耗 {totalExerciseKcal} kcal · {totalDurationMinutes} 分钟
        </p>

        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : logs.length === 0 ? (
          <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
            今天还没有运动记录
          </p>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{log.exerciseType}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {log.durationMinutes} 分钟 · {log.caloriesBurned} kcal
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => void handleDelete(log.id)}
                  aria-label="删除运动记录"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-3">
            <div className="space-y-1.5">
              <Label htmlFor={`exercise-type-${currentDate}`}>运动类型</Label>
              <Input
                id={`exercise-type-${currentDate}`}
                list="exercise-suggestions"
                value={exerciseType}
                onChange={(event) => setExerciseType(event.target.value)}
                required
              />
              <datalist id="exercise-suggestions">
                {EXERCISE_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`exercise-duration-${currentDate}`}>时长 (分钟)</Label>
                <Input
                  id={`exercise-duration-${currentDate}`}
                  type="number"
                  min="1"
                  max="1440"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`exercise-calories-${currentDate}`}>消耗 (kcal)</Label>
                <Input
                  id={`exercise-calories-${currentDate}`}
                  type="number"
                  min="0"
                  max="10000"
                  value={caloriesBurned}
                  onChange={(event) => setCaloriesBurned(Number(event.target.value))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`exercise-note-${currentDate}`}>备注</Label>
              <Input
                id={`exercise-note-${currentDate}`}
                type="text"
                maxLength={300}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="例如：公园慢跑"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
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
