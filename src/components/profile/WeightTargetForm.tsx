"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { todayDate } from "@/lib/date";

interface WeightTargetFormProps {
  currentTarget: string | null;
  onUpdate: (target: number | null) => Promise<boolean>;
}

export function WeightTargetForm({ currentTarget, onUpdate }: WeightTargetFormProps) {
  const currentDate = useMemo(() => todayDate(), []);
  const { data: logs } = useWeightLogs({ startDate: currentDate, endDate: currentDate });
  const todayWeightLog = logs[0] ?? null;
  const [currentTargetValue, setCurrentTargetValue] = useState(currentTarget);
  const [value, setValue] = useState(currentTargetValue ? Number(currentTargetValue) : 0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (value < 20 || value > 500) {
      toast.error("目标体重需在 20-500 kg 之间");
      return;
    }

    setSaving(true);
    try {
      const success = await onUpdate(value);
      if (success) {
        setCurrentTargetValue(value.toFixed(2));
        setIsEditing(false);
        toast.success("体重目标已更新");
      } else {
        toast.error("更新失败");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleClearTarget() {
    setSaving(true);
    try {
      const success = await onUpdate(null);
      if (success) {
        setCurrentTargetValue(null);
        setValue(0);
        setIsEditing(false);
        toast.success("体重目标已清除");
      } else {
        toast.error("清除失败");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(currentTargetValue ? Number(currentTargetValue) : 0);
    setIsEditing(false);
  }

  const currentWeight = todayWeightLog ? Number(todayWeightLog.weightKg) : null;
  const targetDifference = currentWeight !== null && currentTargetValue
    ? currentWeight - Number(currentTargetValue)
    : null;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⚖️</span>
          <span className="text-sm font-semibold text-slate-700">体重目标</span>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCancel} className="text-xs text-slate-400 hover:text-slate-600">
              取消
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-cyan-500 transition-colors hover:text-cyan-600"
          >
            {currentTargetValue ? "修改" : "设置"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <div>
            <input
              type="number"
              min="20"
              max="500"
              step="0.1"
              value={value || ""}
              onChange={(event) => setValue(Number(event.target.value))}
              className="goal-input"
              autoFocus
            />
            <span className="ml-2 text-sm text-slate-400">kg</span>
          </div>
          {currentTargetValue && (
            <button
              type="button"
              onClick={() => void handleClearTarget()}
              disabled={saving}
              className="text-xs text-red-400 hover:text-red-500"
            >
              清除目标
            </button>
          )}
        </div>
      ) : currentTargetValue ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-black text-slate-800">
              {Number(currentTargetValue).toFixed(1)}
              <span className="ml-1 text-sm font-normal text-slate-400">kg</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-400">目标体重</p>
          </div>
          <div>
            <p className="text-2xl font-black text-cyan-600">
              {targetDifference === null ? "--" : `${targetDifference > 0 ? "+" : ""}${targetDifference.toFixed(1)}`}
              <span className="ml-1 text-sm font-normal text-slate-400">kg</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-400">当前差值</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">未设置目标。设置后，进度页面会展示目标对比线。</p>
      )}
    </div>
  );
}
