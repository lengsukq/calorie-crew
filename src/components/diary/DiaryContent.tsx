"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { ExerciseLogItem } from "@/components/diary/ExerciseLogItem";
import { WeightLogItem } from "@/components/diary/WeightLogItem";
import { MealGroup } from "@/components/today/MealGroup";
import { MiniStatCard } from "@/components/shared/MiniStatCard";
import { FoodLogForm } from "@/components/shared/FoodLogForm";
import { FoodLogManualForm } from "@/components/shared/FoodLogManualForm";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { SlideOver } from "@/components/ui/SlideOver";
import { todayDate } from "@/lib/api/client";
import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

const today = todayDate();

function foodLogEntryToFormData(log: FoodLogEntry): FoodLogFormData {
  return {
    mealType: log.mealType,
    foodName: log.foodName,
    servingDescription: log.servingDescription,
    calories: log.calories,
    proteinG: Number(log.proteinG),
    carbsG: Number(log.carbsG),
    fatG: Number(log.fatG),
  };
}

export function DiaryContent() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { logs, loading, error, updateLog, removeLog, reload } = useFoodLogs({
    date: selectedDate,
  });
  const {
    logs: weightLogs,
    loading: weightLoading,
    error: weightError,
    removeLog: removeWeightLog,
  } = useWeightLogs({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const {
    logs: exerciseLogs,
    loading: exerciseLoading,
    error: exerciseError,
    removeLog: removeExerciseLog,
  } = useExerciseLogs({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const editingLog = logs.find((log) => log.id === editingLogId) ?? null;

  async function handleBatchSave(items: FoodLogFormData[]) {
    try {
      const response = await fetch("/api/food-logs/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          logs: items.map((item) => ({ ...item, logDate: selectedDate })),
        }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? "保存失败");
      }
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      toast.error(message);
      throw new Error(message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeLog(id);
      toast.success("已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除失败";
      toast.error(message);
    }
  }

  async function handleDeleteWeightLog(id: string) {
    try {
      await removeWeightLog(id);
      toast.success("体重记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除体重记录失败";
      toast.error(message);
    }
  }

  async function handleDeleteExerciseLog(id: string) {
    try {
      await removeExerciseLog(id);
      toast.success("运动记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除运动记录失败";
      toast.error(message);
    }
  }

  async function handleEditSave(data: FoodLogFormData) {
    if (!editingLog) return;

    try {
      await updateLog(editingLog.id, data);
      toast.success("已更新");
      setEditingLogId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "更新失败";
      toast.error(message);
      throw new Error(message);
    }
  }

  const totalKcal = logs.reduce((s, l) => s + l.calories, 0);
  const totalProtein = logs.reduce((s, l) => s + parseFloat(l.proteinG || "0"), 0);
  const totalCarbs = logs.reduce((s, l) => s + parseFloat(l.carbsG || "0"), 0);
  const totalFat = logs.reduce((s, l) => s + parseFloat(l.fatG || "0"), 0);

  return (
    <div className="stack page-enter">
      {/* Date navigator */}
      <DateNavigator date={selectedDate} onChange={setSelectedDate} />

      {error && (
        <div className="glass-message-error flex items-center justify-between gap-3" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void reload()} className="glass-button !px-3 !py-1 text-xs">
            重试
          </button>
        </div>
      )}

      {/* Daily summary mini cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStatCard label="热量" value={`${totalKcal}`} unit="kcal" />
        <MiniStatCard
          label="蛋白质"
          value={totalProtein.toFixed(1)}
          unit="g"
          gradient="from-purple-400 to-pink-500"
        />
        <MiniStatCard
          label="碳水"
          value={totalCarbs.toFixed(1)}
          unit="g"
          gradient="from-amber-400 to-orange-500"
        />
        <MiniStatCard
          label="脂肪"
          value={totalFat.toFixed(1)}
          unit="g"
          gradient="from-teal-400 to-emerald-500"
        />
      </div>

      {/* Meal groups */}
      {loading ? (
        <div className="glass-card flex items-center justify-center py-8">
          <div className="y2k-spinner h-6 w-6" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card">
          <h2 className="mb-2 text-slate-800">饮食记录</h2>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-3xl opacity-50">📝</span>
            <p className="text-sm text-slate-400">这一天还没有饮食记录</p>
          </div>
        </div>
      ) : (
        <MealGroup
          logs={logs}
          onEdit={setEditingLogId}
          onDelete={handleDelete}
          collapsible
          title="饮食记录"
        />
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="glass-card">
          <h2 className="mb-3 text-sm font-bold text-slate-800">体重记录</h2>
          {weightError && <p className="mb-3 text-xs text-red-500">{weightError}</p>}
          {weightLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
              <span className="y2k-spinner h-4 w-4" /> 正在加载体重记录...
            </div>
          ) : weightLogs.length === 0 ? (
            <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
              这一天还没有体重记录
            </div>
          ) : (
            <div className="space-y-2">
              {weightLogs.map((log) => (
                <WeightLogItem
                  key={log.id}
                  log={log}
                  onDelete={(id) => void handleDeleteWeightLog(id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 className="mb-3 text-sm font-bold text-slate-800">运动记录</h2>
          {exerciseError && <p className="mb-3 text-xs text-red-500">{exerciseError}</p>}
          {exerciseLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
              <span className="y2k-spinner h-4 w-4" /> 正在加载运动记录...
            </div>
          ) : exerciseLogs.length === 0 ? (
            <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
              这一天还没有运动记录
            </div>
          ) : (
            <div className="space-y-2">
              {exerciseLogs.map((log) => (
                <ExerciseLogItem
                  key={log.id}
                  log={log}
                  onDelete={(id) => void handleDeleteExerciseLog(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <QuickAddButton onClick={() => setShowAddSheet(true)} />

      {/* Add food panel */}
      {isDesktop ? (
        <SlideOver
          isOpen={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          title="添加饮食记录"
        >
          <FoodLogForm
            onSubmit={handleBatchSave}
            onCancel={() => setShowAddSheet(false)}
          />
        </SlideOver>
      ) : (
        <BottomSheet
          isOpen={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          title="添加饮食记录"
        >
          <FoodLogForm
            onSubmit={handleBatchSave}
            onCancel={() => setShowAddSheet(false)}
          />
        </BottomSheet>
      )}

      {isDesktop ? (
        <SlideOver
          isOpen={Boolean(editingLog)}
          onClose={() => setEditingLogId(null)}
          title="编辑饮食记录"
        >
          {editingLog && (
            <FoodLogManualForm
              key={editingLog.id}
              initialValue={foodLogEntryToFormData(editingLog)}
              onSubmit={handleEditSave}
              onCancel={() => setEditingLogId(null)}
            />
          )}
        </SlideOver>
      ) : (
        <BottomSheet
          isOpen={Boolean(editingLog)}
          onClose={() => setEditingLogId(null)}
          title="编辑饮食记录"
        >
          {editingLog && (
            <FoodLogManualForm
              key={editingLog.id}
              initialValue={foodLogEntryToFormData(editingLog)}
              onSubmit={handleEditSave}
              onCancel={() => setEditingLogId(null)}
            />
          )}
        </BottomSheet>
      )}
    </div>
  );
}
