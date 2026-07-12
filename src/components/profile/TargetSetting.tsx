"use client";

import { useState } from "react";
import { toast } from "sonner";

interface TargetSettingProps {
  currentTarget: number;
  onUpdate: (target: number) => Promise<boolean>;
}

export function TargetSetting({ currentTarget, onUpdate }: TargetSettingProps) {
  const [value, setValue] = useState(currentTarget);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (value < 500 || value > 10000) {
      toast.error("目标需在 500-10000 之间");
      return;
    }
    setSaving(true);
    try {
      const success = await onUpdate(value);
      if (success) {
        setIsEditing(false);
        toast.success("目标已更新");
      } else {
        toast.error("更新失败");
      }
    } catch {
      toast.error("更新失败");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(currentTarget);
    setIsEditing(false);
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-sm font-semibold text-slate-700">每日热量目标</span>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            修改
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3">
          <input
            type="number"
            min="500"
            max="10000"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="goal-input"
            autoFocus
          />
          <span className="ml-2 text-sm text-slate-400">kcal</span>
        </div>
      ) : (
        <p className="mt-2 text-2xl font-black text-slate-800">
          {currentTarget}
          <span className="ml-1 text-sm font-normal text-slate-400">kcal</span>
        </p>
      )}
    </div>
  );
}
