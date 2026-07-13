"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { ExerciseLogItem } from "@/components/diary/ExerciseLogItem";
import { WeightLogItem } from "@/components/diary/WeightLogItem";
import { MealGroup } from "@/components/today/MealGroup";
import { MiniStatCard } from "@/components/shared/MiniStatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { FoodLogForm } from "@/components/shared/FoodLogForm";
import { FoodLogManualForm } from "@/components/shared/FoodLogManualForm";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { SlideOver } from "@/components/ui/SlideOver";
import { batchActionFoodLogs } from "@/lib/services/food-log.service";
import { todayDate } from "@/lib/api/client";
import type { BodyMeasurementEntry, FoodLogEntry, FoodLogFormData } from "@/shared/types";

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
  const {
    logs: waterLogs,
    loading: waterLoading,
    error: waterError,
    removeLog: removeWaterLog,
  } = useWaterLogs({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const {
    logs: sleepLogs,
    loading: sleepLoading,
    error: sleepError,
    removeLog: removeSleepLog,
  } = useSleepLogs({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const {
    logs: bodyMeasurementLogs,
    loading: bodyMeasurementLoading,
    error: bodyMeasurementError,
    removeLog: removeBodyMeasurementLog,
  } = useBodyMeasurements({
    startDate: selectedDate,
    endDate: selectedDate,
  });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<"delete" | "copy" | null>(null);
  const [batchTargetDate, setBatchTargetDate] = useState(selectedDate);
  const [batchSaving, setBatchSaving] = useState(false);

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

  async function handleDeleteWaterLog(id: string) {
    try {
      await removeWaterLog(id);
      toast.success("饮水记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除饮水记录失败";
      toast.error(message);
    }
  }

  async function handleDeleteSleepLog(id: string) {
    try {
      await removeSleepLog(id);
      toast.success("睡眠记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除睡眠记录失败";
      toast.error(message);
    }
  }

  async function handleDeleteBodyMeasurementLog(id: string) {
    try {
      await removeBodyMeasurementLog(id);
      toast.success("身体数据记录已删除");
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除身体数据记录失败";
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

      {totalKcal > 0 && (
        <AiAdviceCard title="AI 洞察" type="daily_diet" icon="💡" emptyText="暂无异常，继续保持。" autoGenerate />
      )}

      {/* Meal groups */}
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
        <>
          <div className="glass-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-slate-800">饮食记录</h2>
                <span className="text-xs text-slate-400">已选 {selectedFoodIds.size} 项</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBatchAction("copy")}
                  disabled={selectedFoodIds.size === 0}
                  className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  复制到其他日期
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = window.confirm(`确定删除选中的 ${selectedFoodIds.size} 条饮食记录吗？`);
                    if (!confirmed) return;
                    setBatchSaving(true);
                    try {
                      const response = await fetch("/api/food-logs/batch", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ action: "delete", ids: Array.from(selectedFoodIds) }),
                      });
                      if (!response.ok) {
                        const err = (await response.json()) as { error?: string };
                        throw new Error(err.error ?? "批量删除失败");
                      }
                      toast.success("批量删除成功");
                      setSelectedFoodIds(new Set());
                      await reload();
                    } catch (err) {
                      const message = err instanceof Error ? err.message : "批量删除失败";
                      toast.error(message);
                    } finally {
                      setBatchSaving(false);
                    }
                  }}
                  disabled={selectedFoodIds.size === 0 || batchSaving}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  批量删除
                </button>
              </div>
            </div>
            {batchAction === "copy" && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/60 p-3">
                <input
                  type="date"
                  value={batchTargetDate}
                  onChange={(event) => setBatchTargetDate(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                />
                <button
                  type="button"
                  disabled={batchSaving}
                  onClick={async () => {
                    setBatchSaving(true);
                    try {
                      const response = await fetch("/api/food-logs/batch", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ action: "copy", ids: Array.from(selectedFoodIds), targetDate: batchTargetDate }),
                      });
                      if (!response.ok) {
                        const err = (await response.json()) as { error?: string };
                        throw new Error(err.error ?? "复制失败");
                      }
                      toast.success("批量复制成功");
                      setSelectedFoodIds(new Set());
                      setBatchAction(null);
                      await reload();
                    } catch (err) {
                      const message = err instanceof Error ? err.message : "复制失败";
                      toast.error(message);
                    } finally {
                      setBatchSaving(false);
                    }
                  }}
                  className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  确认复制
                </button>
                <button
                  type="button"
                  onClick={() => setBatchAction(null)}
                  className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-white"
                >
                  取消
                </button>
              </div>
            )}
            <MealGroup
              logs={logs}
              onEdit={setEditingLogId}
              onDelete={handleDelete}
              collapsible
              title=""
              selectedIds={selectedFoodIds}
              onToggleSelect={(id) =>
                setSelectedFoodIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) {
                    next.delete(id);
                  } else {
                    next.add(id);
                  }
                  return next;
                })
              }
            />
          </div>
        </>
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

      <div className="grid gap-3 md:grid-cols-2">
        <div className="glass-card">
          <h2 className="mb-3 text-sm font-bold text-slate-800">饮水记录</h2>
          {waterError && <p className="mb-3 text-xs text-red-500">{waterError}</p>}
          {waterLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
              <span className="y2k-spinner h-4 w-4" /> 正在加载饮水记录...
            </div>
          ) : waterLogs.length === 0 ? (
            <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
              这一天还没有饮水记录
            </div>
          ) : (
            <div className="space-y-2">
              {waterLogs.map((log) => (
                <div key={log.id} className="list-item flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{log.amountMl} ml</p>
                    <p className="text-xs text-slate-400">{log.note || "无备注"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteWaterLog(log.id)}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 className="mb-3 text-sm font-bold text-slate-800">睡眠记录</h2>
          {sleepError && <p className="mb-3 text-xs text-red-500">{sleepError}</p>}
          {sleepLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
              <span className="y2k-spinner h-4 w-4" /> 正在加载睡眠记录...
            </div>
          ) : sleepLogs.length === 0 ? (
            <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
              这一天还没有睡眠记录
            </div>
          ) : (
            <div className="space-y-2">
              {sleepLogs.map((log) => {
                const hours = Math.floor(log.sleepMinutes / 60);
                const minutes = log.sleepMinutes % 60;
                return (
                  <div key={log.id} className="list-item flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{hours} 小时 {minutes} 分钟</p>
                      <p className="text-xs text-slate-400">质量 {log.quality} / 5 · {log.note || "无备注"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSleepLog(log.id)}
                      className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h2 className="mb-3 text-sm font-bold text-slate-800">身体围度</h2>
        {bodyMeasurementError && <p className="mb-3 text-xs text-red-500">{bodyMeasurementError}</p>}
        {bodyMeasurementLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
            <span className="y2k-spinner h-4 w-4" /> 正在加载身体数据...
          </div>
        ) : bodyMeasurementLogs.length === 0 ? (
          <div className="rounded-xl bg-white/40 px-3 py-4 text-center text-sm text-slate-400">
            这一天还没有身体围度记录
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {bodyMeasurementLogs.map((log: BodyMeasurementEntry) => (
              <div key={log.id} className="rounded-xl bg-white/50 px-3 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-medium text-slate-400">记录时间</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{log.logDate}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {log.chestCm && <p>胸围: {Number(log.chestCm).toFixed(1)} cm</p>}
                  {log.waistCm && <p>腰围: {Number(log.waistCm).toFixed(1)} cm</p>}
                  {log.hipCm && <p>臀围: {Number(log.hipCm).toFixed(1)} cm</p>}
                  {log.armCm && <p>臂围: {Number(log.armCm).toFixed(1)} cm</p>}
                  {log.legCm && <p>腿围: {Number(log.legCm).toFixed(1)} cm</p>}
                  {log.note && <p className="text-slate-400">{log.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteBodyMeasurementLog(log.id)}
                  className="mt-2 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-500"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
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
