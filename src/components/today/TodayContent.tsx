"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useSummary } from "@/hooks/useSummary";
import { useRecentFoods } from "@/hooks/useRecentFoods";
import { CalorieRing } from "@/components/today/CalorieRing";
import { ExerciseCard } from "@/components/today/ExerciseCard";
import { MealGroup } from "@/components/today/MealGroup";
import { SleepCard } from "@/components/today/SleepCard";
import { WaterCard } from "@/components/today/WaterCard";
import { WeightCard } from "@/components/today/WeightCard";
import { MiniStatCard } from "@/components/shared/MiniStatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { FoodLogEditorOverlay } from "@/components/shared/FoodLogEditorOverlay";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { createFoodLog, deleteFoodLog, updateFoodLog } from "@/lib/api/food-logs";
import { ApiError, todayDate } from "@/lib/api/client";
import { calculateMacroTargets } from "@/shared/constants";
import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

interface TodayContentProps {
  email: string;
  role: string;
  calorieTarget: number;
  weightTargetKg: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function toMacroLite(items: FoodLogFormData[]) {
  return items.map((item) => ({
    mealType: item.mealType,
    foodName: item.foodName,
    servingDescription: item.servingDescription,
    calories: item.calories,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
  }));
}

export function TodayContent({ email, role, calorieTarget, weightTargetKg }: TodayContentProps) {
  const currentDate = todayDate();
  const { data: summaryData, loading, error, reload } = useSummary({ date: currentDate });
  const logs = summaryData?.logs ?? [];
  const summary = summaryData?.summary ?? null;
  const { data: profileData } = useProfile();
  const { recentFoods, addRecentFoods, clearRecentFoods } = useRecentFoods();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);

  const editingLog = logs.find((log) => log.id === editingLogId) ?? null;

  async function handleBatchSave(items: FoodLogFormData[]) {
    try {
      await Promise.all(items.map((item) => createFoodLog(currentDate, item)));
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      addRecentFoods(toMacroLite(items));
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "保存失败";
      toast.error(message);
      throw new Error(message);
    }
  }

  async function handleQuickAdd(food: FoodLogFormData) {
    setQuickSaving(true);
    try {
      await createFoodLog(currentDate, food);
      toast.success(`已添加 ${food.foodName}`);
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "添加失败";
      toast.error(message);
    } finally {
      setQuickSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFoodLog(id);
      toast.success("已删除");
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除失败";
      toast.error(message);
    }
  }

  async function handleEditSave(data: FoodLogFormData) {
    if (!editingLog) return;

    try {
      await updateFoodLog(editingLog.id, currentDate, data);
      toast.success("已更新");
      setEditingLogId(null);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "更新失败";
      toast.error(message);
      throw new Error(message);
    }
  }

  const totalKcal = summary?.totalKcal ?? 0;
  const totalExerciseKcal = summary?.totalExerciseKcal ?? 0;
  const netKcal = summary?.netKcal ?? totalKcal;
  const protein = parseFloat(summary?.totalProteinG ?? "0");
  const carbs = parseFloat(summary?.totalCarbsG ?? "0");
  const fat = parseFloat(summary?.totalFatG ?? "0");
  const remaining = summary?.remainingKcal ?? calorieTarget - netKcal;
  const targets = calculateMacroTargets(calorieTarget);
  const aiAdviceEnabled = profileData?.profile.aiAdviceEnabled ?? true;
  const shouldShowAiAdvice = logs.length > 0 || !aiAdviceEnabled;

  return (
    <div className="stack page-enter">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">{getGreeting()}，{email}</p>
          <h2 className="mt-0.5 text-xl font-bold text-slate-800">今日摄入概览</h2>
        </div>
        <span className="glass-tag">{role === "admin" ? "管理员" : "会员"}</span>
      </div>

      {loading && (
        <div className="glass-card flex items-center justify-center py-4" role="status">
          <span className="y2k-spinner h-5 w-5" />
          <span className="ml-2 text-sm text-slate-400">正在加载今日数据...</span>
        </div>
      )}

      {error && (
        <div className="glass-message-error flex items-center justify-between gap-3" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void reload()} className="glass-button !px-3 !py-1 text-xs">
            重试
          </button>
        </div>
      )}

      <div className="glass-card flex flex-col items-center">
        <CalorieRing current={Math.max(netKcal, 0)} target={calorieTarget} />

        <div className="mt-4 grid w-full grid-cols-3 gap-3">
          <MiniStatCard label="摄入" value={totalKcal} unit="kcal" />
          <MiniStatCard label="运动" value={totalExerciseKcal} unit="kcal" gradient="from-emerald-400 to-teal-500" />
          <MiniStatCard
            label={remaining >= 0 ? "剩余" : "超出"}
            value={Math.abs(remaining)}
            unit="kcal"
            gradient={remaining >= 0 ? "from-cyan-400 to-blue-500" : "from-red-400 to-pink-500"}
          />
        </div>

        <div className="mt-6 grid w-full grid-cols-3 gap-3">
          <MiniStatCard
            label="蛋白质"
            value={protein.toFixed(1)}
            unit="g"
            icon={<span className="text-sm">🥩</span>}
            gradient="from-purple-400 to-pink-500"
            progress={{ current: protein, max: targets.proteinG || 1 }}
          />
          <MiniStatCard
            label="碳水"
            value={carbs.toFixed(1)}
            unit="g"
            icon={<span className="text-sm">🍚</span>}
            gradient="from-amber-400 to-orange-500"
            progress={{ current: carbs, max: targets.carbsG || 1 }}
          />
          <MiniStatCard
            label="脂肪"
            value={fat.toFixed(1)}
            unit="g"
            icon={<span className="text-sm">🧈</span>}
            gradient="from-teal-400 to-emerald-500"
            progress={{ current: fat, max: targets.fatG || 1 }}
          />
        </div>

        <p className="mt-4 text-xs text-slate-400">
          蛋白质目标按 20%、碳水 50%、脂肪 30% 热量占比估算
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <WeightCard currentDate={currentDate} weightTargetKg={weightTargetKg} />
        <ExerciseCard currentDate={currentDate} onChanged={reload} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <WaterCard currentDate={currentDate} />
        <SleepCard currentDate={currentDate} />
      </div>

      {shouldShowAiAdvice && (
        <AiAdviceCard
          title="AI 今日建议"
          type="daily_diet"
          icon="✨"
          enabled={aiAdviceEnabled && logs.length > 0}
          disabledText={aiAdviceEnabled ? "记录一条饮食后，即可生成今日 AI 建议。" : "AI 建议已关闭，可在个人资料中开启。"}
          emptyText="暂无今日建议，点击生成后获取基于今日记录的饮食提示。"
        />
      )}

      {recentFoods.length > 0 && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">最近添加</h2>
            <button
              onClick={clearRecentFoods}
              className="rounded-lg px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-red-500"
            >
              清除
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(food as FoodLogFormData)}
                disabled={quickSaving}
                className="list-item !inline-flex !w-auto !items-center !gap-2 !px-3 !py-2 transition-all hover:border-cyan-200 hover:shadow-sm"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700">{food.foodName}</p>
                  <p className="text-[10px] text-slate-400">
                    {food.calories} kcal · P:{food.proteinG} C:{food.carbsG} F:{food.fatG}
                  </p>
                </div>
                <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-600">+添加</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MealGroup logs={logs} onEdit={setEditingLogId} onDelete={handleDelete} collapsible title="今日饮食" />

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
