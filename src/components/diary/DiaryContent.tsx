"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { FoodBatchToolbar } from "@/components/diary/FoodBatchToolbar";
import { DiaryHealthSections } from "@/components/diary/DiaryHealthSections";
import { MealGroup } from "@/components/today/MealGroup";
import { MiniStatCard } from "@/components/shared/MiniStatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { FoodLogEditorOverlay } from "@/components/shared/FoodLogEditorOverlay";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { batchActionFoodLogs, createFoodLog } from "@/lib/api/food-logs";
import { ApiError, todayDate } from "@/lib/api/client";
import { runWithToast } from "@/lib/ui/with-toast-action";

const today = todayDate();

export function DiaryContent() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: logs, loading, error, updateLog, removeLog, reload } = useFoodLogs({ date: selectedDate });
  const weightLogsHook = useWeightLogs({ startDate: selectedDate, endDate: selectedDate });
  const exerciseLogsHook = useExerciseLogs({ startDate: selectedDate, endDate: selectedDate });
  const waterLogsHook = useWaterLogs({ startDate: selectedDate, endDate: selectedDate });
  const sleepLogsHook = useSleepLogs({ startDate: selectedDate, endDate: selectedDate });
  const bodyMeasurementsHook = useBodyMeasurements({ startDate: selectedDate, endDate: selectedDate });

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<"delete" | "copy" | null>(null);
  const [batchTargetDate, setBatchTargetDate] = useState(selectedDate);
  const [batchSaving, setBatchSaving] = useState(false);

  const editingLog = logs.find((log) => log.id === editingLogId) ?? null;

  async function handleBatchSave(items: Parameters<typeof createFoodLog>[1][]) {
    try {
      await Promise.all(items.map((item) => createFoodLog(selectedDate, item)));
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "保存失败";
      toast.error(message);
      throw new Error(message);
    }
  }

  async function handleDelete(id: string) {
    await runWithToast(() => removeLog(id), { success: "已删除", failure: "删除失败" });
  }

  async function handleDeleteHealthLog(
    action: (id: string) => Promise<void>,
    id: string,
    successMessage: string,
    failureMessage: string,
  ) {
    await runWithToast(() => action(id), { success: successMessage, failure: failureMessage });
  }

  async function handleEditSave(data: Parameters<typeof updateLog>[1]) {
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

  async function handleBatchDelete() {
    const confirmed = window.confirm(`确定删除选中的 ${selectedFoodIds.size} 条饮食记录吗？`);
    if (!confirmed) return;

    setBatchSaving(true);
    try {
      await batchActionFoodLogs("delete", Array.from(selectedFoodIds));
      toast.success("批量删除成功");
      setSelectedFoodIds(new Set());
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "批量删除失败";
      toast.error(message);
    } finally {
      setBatchSaving(false);
    }
  }

  async function handleBatchCopy() {
    setBatchSaving(true);
    try {
      await batchActionFoodLogs("copy", Array.from(selectedFoodIds), batchTargetDate);
      toast.success("批量复制成功");
      setSelectedFoodIds(new Set());
      setBatchAction(null);
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "复制失败";
      toast.error(message);
    } finally {
      setBatchSaving(false);
    }
  }

  function toggleSelectedFood(id: string) {
    setSelectedFoodIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const totalKcal = logs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = logs.reduce((sum, log) => sum + parseFloat(log.proteinG || "0"), 0);
  const totalCarbs = logs.reduce((sum, log) => sum + parseFloat(log.carbsG || "0"), 0);
  const totalFat = logs.reduce((sum, log) => sum + parseFloat(log.fatG || "0"), 0);

  return (
    <div className="stack page-enter">
      <DateNavigator date={selectedDate} onChange={setSelectedDate} />

      {error && (
        <div className="glass-message-error flex items-center justify-between gap-3" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void reload()} className="glass-button !px-3 !py-1 text-xs">
            重试
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStatCard label="热量" value={`${totalKcal}`} unit="kcal" />
        <MiniStatCard label="蛋白质" value={totalProtein.toFixed(1)} unit="g" gradient="from-purple-400 to-pink-500" />
        <MiniStatCard label="碳水" value={totalCarbs.toFixed(1)} unit="g" gradient="from-amber-400 to-orange-500" />
        <MiniStatCard label="脂肪" value={totalFat.toFixed(1)} unit="g" gradient="from-teal-400 to-emerald-500" />
      </div>

      {totalKcal > 0 && (
        <AiAdviceCard title="AI 洞察" type="daily_diet" icon="💡" emptyText="暂无异常，继续保持。" autoGenerate />
      )}

      {loading ? (
        <div className="glass-card flex items-center justify-center py-8">
          <div className="y2k-spinner h-6 w-6" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-slate-800">饮食记录</h2>
          </div>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-3xl opacity-50">📝</span>
            <p className="text-sm text-slate-400">这一天还没有饮食记录</p>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <FoodBatchToolbar
            selectedCount={selectedFoodIds.size}
            batchSaving={batchSaving}
            batchAction={batchAction}
            batchTargetDate={batchTargetDate}
            onStartCopy={() => setBatchAction("copy")}
            onCancelCopy={() => setBatchAction(null)}
            onConfirmCopy={() => void handleBatchCopy()}
            onBatchDelete={() => void handleBatchDelete()}
            onBatchTargetDateChange={setBatchTargetDate}
          />
          <MealGroup
            logs={logs}
            onEdit={setEditingLogId}
            onDelete={(id) => void handleDelete(id)}
            collapsible
            title=""
            selectedIds={selectedFoodIds}
            onToggleSelect={toggleSelectedFood}
          />
        </div>
      )}

      <DiaryHealthSections
        weight={{
          id: "weight",
          data: weightLogsHook.data,
          loading: weightLogsHook.loading,
          error: weightLogsHook.error,
          onRemove: (id) => void handleDeleteHealthLog(
            weightLogsHook.removeLog,
            id,
            "体重记录已删除",
            "删除体重记录失败",
          ),
        }}
        exercise={{
          id: "exercise",
          data: exerciseLogsHook.data,
          loading: exerciseLogsHook.loading,
          error: exerciseLogsHook.error,
          onRemove: (id) => void handleDeleteHealthLog(
            exerciseLogsHook.removeLog,
            id,
            "运动记录已删除",
            "删除运动记录失败",
          ),
        }}
        water={{
          id: "water",
          data: waterLogsHook.data,
          loading: waterLogsHook.loading,
          error: waterLogsHook.error,
          onRemove: (id) => void handleDeleteHealthLog(
            waterLogsHook.removeLog,
            id,
            "饮水记录已删除",
            "删除饮水记录失败",
          ),
        }}
        sleep={{
          id: "sleep",
          data: sleepLogsHook.data,
          loading: sleepLogsHook.loading,
          error: sleepLogsHook.error,
          onRemove: (id) => void handleDeleteHealthLog(
            sleepLogsHook.removeLog,
            id,
            "睡眠记录已删除",
            "删除睡眠记录失败",
          ),
        }}
        bodyMeasurements={{
          id: "body",
          data: bodyMeasurementsHook.data,
          loading: bodyMeasurementsHook.loading,
          error: bodyMeasurementsHook.error,
          onRemove: (id) => void handleDeleteHealthLog(
            bodyMeasurementsHook.removeLog,
            id,
            "身体数据记录已删除",
            "删除身体数据记录失败",
          ),
        }}
      />

      <QuickAddButton onClick={() => setShowAddSheet(true)} />

      <FoodLogEditorOverlay
        isOpenForAdd={showAddSheet}
        editingLog={editingLog}
        onAddSubmit={handleBatchSave}
        onEditSubmit={handleEditSave}
        onCloseAdd={() => setShowAddSheet(false)}
        onCloseEdit={() => setEditingLogId(null)}
      />
    </div>
  );
}
