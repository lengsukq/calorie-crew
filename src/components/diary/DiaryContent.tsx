"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { useConfirm } from "@/lib/ui/confirm";
import { useRecordTrigger } from "@/hooks/useRecordTrigger";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { FoodBatchToolbar } from "@/components/diary/FoodBatchToolbar";
import { DiaryHealthSections } from "@/components/diary/DiaryHealthSections";
import { MealGroup } from "@/components/today/MealGroup";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/progress/ProgressParts";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { FoodLogEditorOverlay } from "@/components/shared/FoodLogEditorOverlay";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { todayDate } from "@/lib/date";
import { runWithToast } from "@/lib/ui/with-toast-action";
import type { FoodLogFormData } from "@/shared/types";

const today = todayDate();

export function DiaryContent() {
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: logs, loading, error, addLog, updateLog, removeLog, reload, batchDelete, batchCopy } = useFoodLogs({ date: selectedDate });
  const weightLogsHook = useWeightLogs({ startDate: selectedDate, endDate: selectedDate });
  const exerciseLogsHook = useExerciseLogs({ startDate: selectedDate, endDate: selectedDate });
  const waterLogsHook = useWaterLogs({ startDate: selectedDate, endDate: selectedDate });
  const sleepLogsHook = useSleepLogs({ startDate: selectedDate, endDate: selectedDate });
  const bodyMeasurementsHook = useBodyMeasurements({ startDate: selectedDate, endDate: selectedDate });
  const { data: profileData } = useProfile();
  const confirm = useConfirm();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<"delete" | "copy" | null>(null);
  const [batchTargetDate, setBatchTargetDate] = useState(selectedDate);
  const [batchSaving, setBatchSaving] = useState(false);

  const editingLog = logs.find((log) => log.id === editingLogId) ?? null;

  const openRecordFromTrigger = useCallback(() => {
    setShowAddSheet(true);
  }, []);
  useRecordTrigger(openRecordFromTrigger);

  async function handleBatchSave(items: FoodLogFormData[]) {
    try {
      await Promise.all(items.map((item) => addLog(item)));
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      await reload();
    } catch {
      toast.error("保存失败");
      throw new Error("保存失败");
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "删除饮食记录",
      description: "确定删除这条记录吗？",
      confirmText: "删除",
      destructive: true,
    });
    if (!ok) return;
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

  async function handleEditSave(data: FoodLogFormData) {
    if (!editingLog) return;

    try {
      await updateLog(editingLog.id, data);
      toast.success("已更新");
      setEditingLogId(null);
    } catch {
      toast.error("更新失败");
      throw new Error("更新失败");
    }
  }

  async function handleBatchDelete() {
    const ok = await confirm({
      title: "批量删除饮食记录",
      description: `确定删除选中的 ${selectedFoodIds.size} 条记录吗？`,
      confirmText: "删除",
      destructive: true,
    });
    if (!ok) return;

    setBatchSaving(true);
    try {
      await batchDelete(Array.from(selectedFoodIds));
      toast.success("批量删除成功");
      setSelectedFoodIds(new Set());
    } catch {
      toast.error("批量删除失败");
    } finally {
      setBatchSaving(false);
    }
  }

  async function handleBatchCopy() {
    setBatchSaving(true);
    try {
      await batchCopy(Array.from(selectedFoodIds), batchTargetDate);
      toast.success("批量复制成功");
      setSelectedFoodIds(new Set());
      setBatchAction(null);
    } catch {
      toast.error("复制失败");
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
        <Card>
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <span className="text-sm text-destructive">{error}</span>
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              重试
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="热量" value={totalKcal} unit="kcal" accentColor="primary" />
        <StatCard label="蛋白质" value={totalProtein.toFixed(1)} unit="g" accentColor="purple" />
        <StatCard label="碳水" value={totalCarbs.toFixed(1)} unit="g" accentColor="warning" />
        <StatCard label="脂肪" value={totalFat.toFixed(1)} unit="g" accentColor="success" />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<UtensilsCrossed className="h-8 w-8" />}
              text="这一天还没有饮食记录"
              hint="点击下方按钮或中央记录按钮添加"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
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

      {totalKcal > 0 && (
        <AiAdviceCard
          title="AI 洞察"
          type="daily_diet"
          emptyText="暂无异常，继续保持。"
          autoGenerate={(profileData?.profile.aiAdviceFrequency ?? "daily") === "daily"}
        />
      )}

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
