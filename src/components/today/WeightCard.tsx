"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWeightLogs } from "@/hooks/useWeightLogs";

interface WeightCardProps {
  currentDate: string;
  weightTargetKg: string | null;
}

export function WeightCard({ currentDate, weightTargetKg }: WeightCardProps) {
  const { logs, loading, error, saveLog } = useWeightLogs({
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
      toast.error("体重需在 20-500 kg 之间");
      return;
    }

    setSaving(true);
    try {
      await saveLog({ logDate: currentDate, weightKg, note });
      toast.success(todayWeightLog ? "今日体重已更新" : "今日体重已记录");
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存体重失败";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const targetDifference = todayWeightLog && weightTargetKg
    ? Number(todayWeightLog.weightKg) - Number(weightTargetKg)
    : null;

  return (
    <div className="glass-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <h2 className="text-sm font-bold text-slate-800">今日体重</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {weightTargetKg ? `目标 ${Number(weightTargetKg).toFixed(1)} kg` : "尚未设置体重目标"}
          </p>
        </div>
        <button type="button" onClick={startEditing} className="glass-button !px-3 !py-1.5 text-xs">
          {todayWeightLog ? "更新" : "记录"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <span className="y2k-spinner h-4 w-4" /> 正在加载体重记录...
        </div>
      ) : todayWeightLog ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-medium text-slate-400">已记录</p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {Number(todayWeightLog.weightKg).toFixed(1)}
              <span className="ml-1 text-xs font-normal text-slate-400">kg</span>
            </p>
          </div>
          <div className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-medium text-slate-400">目标差值</p>
            <p className="mt-1 text-lg font-bold text-cyan-600">
              {targetDifference === null
                ? "--"
                : `${targetDifference > 0 ? "+" : ""}${targetDifference.toFixed(1)} kg`}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
          今天还没有记录体重
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-slate-100/60 pt-4">
          <label className="block text-xs font-semibold text-slate-500">
            体重 (kg)
            <input
              type="number"
              min="20"
              max="500"
              step="0.1"
              value={weightKg || ""}
              onChange={(event) => setWeightKg(Number(event.target.value))}
              className="goal-input mt-1"
              required
            />
          </label>
          <label className="block text-xs font-semibold text-slate-500">
            备注
            <input
              type="text"
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="goal-input mt-1"
              placeholder="例如：晨起空腹"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-slate-400">
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
