"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";

const EXERCISE_SUGGESTIONS = ["跑步", "快走", "骑行", "游泳", "力量训练", "瑜伽"];

interface ExerciseCardProps {
  currentDate: string;
  onChanged: () => Promise<void>;
}

export function ExerciseCard({ currentDate, onChanged }: ExerciseCardProps) {
  const { logs, loading, error, addLog, removeLog } = useExerciseLogs({
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
      await addLog({ logDate: currentDate, exerciseType, durationMinutes, caloriesBurned, note });
      await onChanged();
      toast.success("运动记录已添加");
      setIsAdding(false);
      setNote("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存运动失败";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeLog(id);
      await onChanged();
      toast.success("运动记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除运动失败";
      toast.error(message);
    }
  }

  return (
    <div className="glass-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏃</span>
            <h2 className="text-sm font-bold text-slate-800">今日运动</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            已消耗 {totalExerciseKcal} kcal · {totalDurationMinutes} 分钟
          </p>
        </div>
        <button type="button" onClick={() => setIsAdding(true)} className="glass-button !px-3 !py-1.5 text-xs">
          添加运动
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="y2k-spinner h-4 w-4" /> 正在加载运动记录...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
            今天还没有运动记录
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="list-item flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{log.exerciseType}</p>
                <p className="text-xs text-slate-400">
                  {log.durationMinutes} 分钟 · {log.caloriesBurned} kcal
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(log.id)}
                className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-slate-100/60 pt-4">
          <label className="block text-xs font-semibold text-slate-500">
            运动类型
            <input
              list="exercise-suggestions"
              value={exerciseType}
              onChange={(event) => setExerciseType(event.target.value)}
              className="goal-input mt-1"
              required
            />
            <datalist id="exercise-suggestions">
              {EXERCISE_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-500">
              时长 (分钟)
              <input
                type="number"
                min="1"
                max="1440"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className="goal-input mt-1"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-slate-500">
              消耗 (kcal)
              <input
                type="number"
                min="0"
                max="10000"
                value={caloriesBurned}
                onChange={(event) => setCaloriesBurned(Number(event.target.value))}
                className="goal-input mt-1"
                required
              />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-500">
            备注
            <input
              type="text"
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="goal-input mt-1"
              placeholder="例如：公园慢跑"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-400">
              取消
            </button>
            <button type="submit" disabled={saving} className="glass-button !px-4 !py-2 text-xs">
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
