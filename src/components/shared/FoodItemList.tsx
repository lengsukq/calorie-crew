"use client";

import { X } from "lucide-react";
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
      <div className="flex flex-col items-center gap-1 py-6 text-center">
        <p className="text-sm text-muted-foreground">还没有选择食物</p>
        <p className="text-xs text-muted-foreground">使用上方搜索或 AI 识别来添加</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">已选食物 ({items.length})</span>
        <span className="text-xs font-bold text-primary tabular-nums">总计 {totalCalories} kcal</span>
      </div>

      {items.map((item) => (
        <div
          key={item.tempId}
          className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{item.foodName}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <input
                value={item.servingDescription}
                onChange={(e) => onUpdateServing(item.tempId, e.target.value)}
                className="w-20 rounded border-0 bg-muted px-2 py-0.5 text-xs text-foreground outline-none ring-1 ring-transparent focus:ring-ring"
                placeholder="份量"
              />
              <span className="text-xs font-semibold text-primary tabular-nums">{item.calories} kcal</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                P{item.proteinG} C{item.carbsG} F{item.fatG}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(item.tempId)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`删除 ${item.foodName}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
