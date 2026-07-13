"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWaterLogs } from "@/hooks/useWaterLogs";

const WATER_SUGGESTIONS = [250, 500, 750];

interface WaterCardProps {
  currentDate: string;
}

export function WaterCard({ currentDate }: WaterCardProps) {
  const { logs, loading, error, addLog, removeLog } = useWaterLogs({
    startDate: currentDate,
    endDate: currentDate,
  });
  const [amount, setAmount] = useState(500);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await addLog({ logDate: currentDate, amountMl: amount, note });
      toast.success("饮水已记录");
      setNote("");
    } catch {
      toast.error("保存饮水失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">💧</span>
            <h2 className="text-sm font-bold text-slate-800">今日饮水</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">已记录 {totalMl} ml</p>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="y2k-spinner h-4 w-4" /> 正在加载饮水记录...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
            今天还没有饮水记录
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="list-item flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{log.amountMl} ml</p>
                <p className="text-xs text-slate-400">{log.note || "无备注"}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeLog(log.id)}
                className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-slate-100/60 pt-4">
        <div className="flex flex-wrap gap-2">
          {WATER_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setAmount(suggestion)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                amount === suggestion
                  ? "bg-cyan-50 text-cyan-600"
                  : "bg-white/60 text-slate-500 hover:bg-white/80"
              }`}
            >
              {suggestion} ml
            </button>
          ))}
        </div>
        <label className="block text-xs font-semibold text-slate-500">
          饮水量 (ml)
          <input
            type="number"
            min="1"
            max="10000"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
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
            placeholder="例如：晨起一杯水"
          />
        </label>
        <button type="submit" disabled={saving} className="glass-button w-full !px-4 !py-2 text-xs">
          {saving ? "保存中..." : "记录饮水"}
        </button>
      </form>
    </div>
  );
}