"use client";

import type { FoodLogFormData } from "@/shared/types";

export interface SelectedFood extends FoodLogFormData {
  tempId: string;
}

interface FoodItemListProps {
  items: SelectedFood[];
  onRemove: (tempId: string) => void;
  onUpdateServing: (tempId: string, serving: string) => void;
}

export function FoodItemList({ items, onRemove, onUpdateServing }: FoodItemListProps) {
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-2xl opacity-40">🍽️</span>
        <p className="text-xs text-slate-400">还没有选择食物</p>
        <p className="text-[10px] text-slate-300">
          使用上方搜索或 AI 识别来添加食物
        </p>
      </div>
    );
  }

  return (
    <div className="stack gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          已选食物 ({items.length})
        </span>
        <span className="text-xs font-bold text-cyan-600">
          总计: {totalCalories} kcal
        </span>
      </div>

      {items.map((item) => (
        <div key={item.tempId} className="list-item !py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{item.foodName}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <input
                  value={item.servingDescription}
                  onChange={(e) => onUpdateServing(item.tempId, e.target.value)}
                  className="w-20 rounded-lg border-0 bg-white/60 px-2 py-0.5 text-xs text-slate-500 outline-none ring-1 ring-slate-200/50 focus:ring-cyan-300"
                  placeholder="份量"
                />
                <span className="text-xs text-cyan-600 font-semibold">
                  {item.calories} kcal
                </span>
                <span className="text-[10px] text-slate-400">
                  P:{item.proteinG} C:{item.carbsG} F:{item.fatG}
                </span>
              </div>
            </div>
            <button
              onClick={() => onRemove(item.tempId)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={`删除 ${item.foodName}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
