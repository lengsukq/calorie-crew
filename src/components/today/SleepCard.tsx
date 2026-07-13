"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSleepLogs } from "@/hooks/useSleepLogs";

interface SleepCardProps {
  currentDate: string;
}

export function SleepCard({ currentDate }: SleepCardProps) {
  const { logs, loading, error, saveLog, removeLog } = useSleepLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const todaySleepLog = logs[0] ?? null;
  const [sleepMinutes, setSleepMinutes] = useState(todaySleepLog ? todaySleepLog.sleepMinutes : 420);
  const [quality, setQuality] = useState(todaySleepLog ? todaySleepLog.quality : 3);
  const [note, setNote] = useState(todaySleepLog?.note ?? "");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setSleepMinutes(todaySleepLog ? todaySleepLog.sleepMinutes : 420);
    setQuality(todaySleepLog ? todaySleepLog.quality : 3);
    setNote(todaySleepLog?.note ?? "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveLog({ logDate: currentDate, sleepMinutes, quality, note });
      toast.success("睡眠记录已保存");
    } catch {
      toast.error("保存睡眠失败");
    } finally {
      setSaving(false);
    }
  }

  const hours = Math.floor(sleepMinutes / 60);
  const minutes = sleepMinutes % 60;

  return (
    <div className="glass-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">😴</span>
            <h2 className="text-sm font-bold text-slate-800">昨晚睡眠</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {todaySleepLog ? `已记录 ${hours} 小时 ${minutes} 分钟` : "今天还没有睡眠记录"}
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="y2k-spinner h-4 w-4" /> 正在加载睡眠记录...
          </div>
        ) : todaySleepLog ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-medium text-slate-400">时长</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {hours}
                <span className="ml-1 text-xs font-normal text-slate-400">小时 {minutes} 分钟</span>
              </p>
            </div>
            <div className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-medium text-slate-400">质量</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {quality}
                <span className="ml-1 text-xs font-normal text-slate-400">/ 5</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
            记录昨晚睡眠，追踪睡眠趋势
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-slate-100/60 pt-4">
        <label className="block text-xs font-semibold text-slate-500">
          睡眠时长 (分钟)
          <input
            type="number"
            min="0"
            max="1440"
            value={sleepMinutes}
            onChange={(event) => setSleepMinutes(Number(event.target.value))}
            className="goal-input mt-1"
            required
          />
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          睡眠质量 (1-5)
          <input
            type="number"
            min="1"
            max="5"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
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
            placeholder="例如：睡前喝了咖啡"
          />
        </label>
        <button type="submit" disabled={saving} className="glass-button w-full !px-4 !py-2 text-xs">
          {saving ? "保存中..." : "保存睡眠"}
        </button>
      </form>
    </div>
  );
}