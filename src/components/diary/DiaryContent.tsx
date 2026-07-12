"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { FoodLogForm } from "@/components/shared/FoodLogForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { MEAL_LABELS, MEAL_ORDER } from "@/shared/constants";
import { todayDate } from "@/lib/api/client";
import type { FoodLogFormData } from "@/shared/types";

const today = todayDate();

export function DiaryContent() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { logs, loading, addLog, removeLog } = useFoodLogs({
    date: selectedDate,
  });
  const [showAddSheet, setShowAddSheet] = useState(false);

  async function handleAddLog(data: FoodLogFormData) {
    try {
      await addLog(data);
      setShowAddSheet(false);
      toast.success("记录已保存");
    } catch {
      toast.error("保存失败");
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeLog(id);
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  const totalKcal = logs.reduce((s, l) => s + l.calories, 0);

  const grouped = MEAL_ORDER.map((type) => ({
    type,
    label: MEAL_LABELS[type],
    items: logs.filter((l) => l.mealType === type),
  }));

  return (
    <div className="stack page-enter">
      <DateNavigator date={selectedDate} onChange={setSelectedDate} />

      {/* Daily summary mini cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="热量" value={`${totalKcal}`} unit="kcal" />
        <MiniStat label="蛋白质" value={formatMacro(logs, "proteinG")} unit="g" />
        <MiniStat label="碳水" value={formatMacro(logs, "carbsG")} unit="g" />
        <MiniStat label="脂肪" value={formatMacro(logs, "fatG")} unit="g" />
      </div>

      {/* Entries by meal */}
      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">饮食记录</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="y2k-spinner h-6 w-6" />
          </div>
        ) : (
          <div className="stack gap-4">
            {grouped.map((group) => (
              <div key={group.type}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">
                    {group.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {group.items.reduce((s, i) => s + i.calories, 0)} kcal
                  </span>
                </div>
                {group.items.length === 0 ? (
                  <p className="px-2 text-xs text-slate-300">暂无记录</p>
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
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-cyan-600">
                              {item.calories}
                              <span className="ml-0.5 text-xs font-normal text-slate-400">
                                kcal
                              </span>
                            </span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label="删除"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <span className="text-3xl opacity-50">📝</span>
          <p className="text-sm text-slate-400">这一天还没有饮食记录</p>
        </div>
      )}

      <button
        onClick={() => setShowAddSheet(true)}
        className="glass-button-primary w-full"
      >
        + 添加记录
      </button>

      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="添加饮食记录"
      >
        <FoodLogForm
          onSubmit={handleAddLog}
          onCancel={() => setShowAddSheet(false)}
        />
      </BottomSheet>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-white/50 px-3 py-3 text-center backdrop-blur-sm">
      <p className="text-lg font-bold text-slate-700">
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

function formatMacro(
  logs: { proteinG: string; carbsG: string; fatG: string }[],
  field: "proteinG" | "carbsG" | "fatG",
): string {
  const total = logs.reduce((s, l) => s + parseFloat(l[field] || "0"), 0);
  return total.toFixed(1);
}
