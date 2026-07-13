"use client";

import { useState } from "react";
import type { MealType } from "@/lib/db/schema";
import { MEAL_ORDER, MEAL_LABELS, MEAL_ICONS } from "@/shared/constants";

interface Log {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
  proteinG?: string;
  carbsG?: string;
  fatG?: string;
}

interface MealGroupProps {
  logs: Log[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  collapsible?: boolean;
  title?: string;
}

export function MealGroup({
  logs,
  onDelete,
  onEdit,
  collapsible = true,
  title = "饮食记录",
}: MealGroupProps) {
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set());

  const grouped = MEAL_ORDER.map((type) => ({
    type,
    label: MEAL_LABELS[type],
    icon: MEAL_ICONS[type],
    items: logs.filter((l) => l.mealType === type),
  }));

  const hasAny = grouped.some((g) => g.items.length > 0);

  function toggleCollapse(type: string) {
    setCollapsedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  if (!hasAny) {
    return (
      <div className="glass-card">
        <h2 className="mb-2 text-slate-800">{title}</h2>
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-text">
            还没有记录，开始添加吧！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h2 className="mb-4 text-slate-800">{title}</h2>
      <div className="space-y-4">
        {grouped.map((group) => {
          const isCollapsed = collapsedMeals.has(group.type);
          const totalKcal = group.items.reduce((s, i) => s + i.calories, 0);

          return (
            <div key={group.type}>
              {/* Meal header */}
              <button
                onClick={() => collapsible && toggleCollapse(group.type)}
                className={`flex w-full items-center gap-2 text-left ${
                  collapsible ? "cursor-pointer" : "cursor-default"
                }`}
                type="button"
              >
                <span className="text-base">{group.icon}</span>
                <span className="text-sm font-semibold text-slate-600">
                  {group.label}
                </span>
                <span className="text-xs text-slate-400">
                  {totalKcal} kcal
                </span>
                {collapsible && (
                  <span className="ml-auto text-xs text-slate-300 transition-transform duration-200">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                )}
              </button>

              {/* Meal items */}
              {!isCollapsed && (
                <div className="mt-2 space-y-1.5">
                  {group.items.length === 0 ? (
                    <p className="px-7 text-xs text-slate-300">暂无记录</p>
                  ) : (
                    group.items.map((item) => (
                      <div key={item.id} className="list-item !py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                {item.foodName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {item.servingDescription}
                              </span>
                            </div>
                            {(item.proteinG || item.carbsG || item.fatG) && (
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                P: {parseFloat(item.proteinG ?? "0").toFixed(1)}g · C:{" "}
                                {parseFloat(item.carbsG ?? "0").toFixed(1)}g · F:{" "}
                                {parseFloat(item.fatG ?? "0").toFixed(1)}g
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-bold text-cyan-600">
                              {item.calories}
                              <span className="ml-0.5 text-xs font-normal text-slate-400">
                                kcal
                              </span>
                            </span>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-slate-300 transition-colors hover:bg-cyan-50 hover:text-cyan-500"
                                aria-label="编辑"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                aria-label="删除"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
