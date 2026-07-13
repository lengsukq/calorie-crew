"use client";

import type { ExerciseLogEntry } from "@/shared/types";

interface ExerciseLogItemProps {
  log: ExerciseLogEntry;
  onDelete: (id: string) => void;
}

export function ExerciseLogItem({ log, onDelete }: ExerciseLogItemProps) {
  return (
    <div className="list-item flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">{log.exerciseType}</p>
        <p className="text-xs text-slate-400">
          {log.durationMinutes} 分钟 · {log.caloriesBurned} kcal
          {log.note ? ` · ${log.note}` : ""}
        </p>
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
