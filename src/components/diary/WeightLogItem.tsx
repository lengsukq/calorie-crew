"use client";

import type { WeightLogEntry } from "@/shared/types";

interface WeightLogItemProps {
  log: WeightLogEntry;
  onDelete: (id: string) => void;
}

export function WeightLogItem({ log, onDelete }: WeightLogItemProps) {
  return (
    <div className="list-item flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          {Number(log.weightKg).toFixed(1)} kg
        </p>
        <p className="text-xs text-slate-400">{log.note || "无备注"}</p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(log.id)}
        className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
      >
        删除
      </button>
    </div>
  );
}
