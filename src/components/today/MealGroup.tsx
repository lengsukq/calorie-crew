"use client";

import type { MealType } from "@/lib/db/schema";

interface Log {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
}

interface MealGroupProps {
  logs: Log[];
  onDelete?: (id: string) => void;
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: "早餐", icon: "🌅" },
  lunch: { label: "午餐", icon: "🌞" },
  dinner: { label: "晚餐", icon: "🌆" },
  snack: { label: "加餐", icon: "🌙" },
};

export function MealGroup({ logs, onDelete }: MealGroupProps) {
  const grouped = MEAL_ORDER.map((type) => ({
    type,
    ...MEAL_LABELS[type],
    items: logs.filter((l) => l.mealType === type),
  }));

  const hasAny = grouped.some((g) => g.items.length > 0);

  if (!hasAny) {
    return (
      <div className="glass-card">
        <h2 className="mb-2 text-slate-800">今日饮食</h2>
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-text">今天还没有记录，开始添加吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h2 className="mb-4 text-slate-800">今日饮食</h2>
      <div className="stack gap-3">
        {grouped.map((group) => (
          <div key={group.type}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base">{group.icon}</span>
              <span className="text-sm font-semibold text-slate-600">
                {group.label}
              </span>
              <span className="text-xs text-slate-400">
                {group.items.reduce((s, i) => s + i.calories, 0)} kcal
              </span>
            </div>
            {group.items.length === 0 ? (
              <p className="px-7 text-xs text-slate-300">暂无记录</p>
            ) : (
              <div className="stack gap-1.5">
                {group.items.map((item) => (
                  <div key={item.id} className="list-item !py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          {item.foodName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.servingDescription}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-600">
                          {item.calories}
                          <span className="ml-0.5 text-xs font-normal text-slate-400">
                            kcal
                          </span>
                        </span>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="text-xs text-slate-300 hover:text-red-500 transition-colors"
                            aria-label="删除"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
