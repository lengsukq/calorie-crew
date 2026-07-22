"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSummary } from "@/hooks/useSummary";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useRecentFoods } from "@/hooks/useRecentFoods";
import { useConfirm } from "@/lib/ui/confirm";
import { CalorieRing } from "@/components/today/CalorieRing";
import { ExerciseCard } from "@/components/today/ExerciseCard";
import { MealGroup } from "@/components/today/MealGroup";
import { SleepCard } from "@/components/today/SleepCard";
import { WaterCard } from "@/components/today/WaterCard";
import { WeightCard } from "@/components/today/WeightCard";
import { StatCard } from "@/components/shared/StatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { FoodLogEditorOverlay } from "@/components/shared/FoodLogEditorOverlay";
import { QuickAddButton } from "@/components/shared/QuickAddButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { todayDate } from "@/lib/date";
import { calculateMacroTargets } from "@/shared/constants";
import type { MealType } from "@/lib/db/schema";
import type { FoodLogFormData } from "@/shared/types";

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
  const { addLog: addFoodLog, updateLog: updateFoodLog, removeLog: removeFoodLog } = useFoodLogs({ date: currentDate, enabled: false });
  const { recentFoods, addRecentFoods, clearRecentFoods } = useRecentFoods();
  const confirm = useConfirm();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addMealType, setAddMealType] = useState<string>("breakfast");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [quickSavingId, setQuickSavingId] = useState<string | null>(null);

  const editingLog = logs.find((log) => log.id === editingLogId) ?? null;

  async function handleBatchSave(items: FoodLogFormData[]) {
    try {
      await Promise.all(items.map((item) => addFoodLog(item)));
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      addRecentFoods(toMacroLite(items));
      await reload();
    } catch {
      toast.error("保存失败");
      throw new Error("保存失败");
    }
  }

  async function handleQuickAdd(food: FoodLogFormData, key: string) {
    setQuickSavingId(key);
    try {
      await addFoodLog(food);
      toast.success(`已添加 ${food.foodName}`);
      await reload();
    } catch {
      toast.error("添加失败");
    } finally {
      setQuickSavingId(null);
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

    try {
      await removeFoodLog(id);
      toast.success("已删除");
      await reload();
    } catch {
      toast.error("删除失败");
    }
  }

  async function handleEditSave(data: FoodLogFormData) {
    if (!editingLog) return;

    try {
      await updateFoodLog(editingLog.id, data);
      toast.success("已更新");
      setEditingLogId(null);
      await reload();
    } catch {
      toast.error("更新失败");
      throw new Error("更新失败");
    }
  }

  function openAddSheet(mealType?: MealType) {
    setAddMealType(mealType ?? "breakfast");
    setShowAddSheet(true);
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
      {/* 问候区（单行紧凑） */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {getGreeting()}，<span className="font-medium text-foreground">{email}</span>
        </p>
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role === "admin" ? "管理员" : "会员"}
        </Badge>
      </div>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">正在加载今日数据...</span>
          </CardContent>
        </Card>
      )}

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

      {/* 仪表盘双栏：
          移动端顺序 = 概览 → 餐食/最近/AI → 健康追踪
          桌面端 (lg) = 左栏(概览 + 健康追踪) | 右栏(餐食 + 最近 + AI) */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* 概览：热量环 + 摄入/运动/剩余 + 宏量营养素 */}
        <Card className="lg:col-start-1 lg:row-start-1">
          <CardContent className="pt-6">
            <CalorieRing current={Math.max(netKcal, 0)} target={calorieTarget} size={170} />

            <div className="mt-4 grid w-full grid-cols-3 gap-3">
              <StatCard label="摄入" value={totalKcal} unit="kcal" />
              <StatCard label="运动" value={totalExerciseKcal} unit="kcal" accentColor="success" />
              <StatCard
                label={remaining >= 0 ? "剩余" : "超出"}
                value={Math.abs(remaining)}
                unit="kcal"
                accentColor={remaining >= 0 ? "primary" : "danger"}
              />
            </div>

            <div className="mt-3 grid w-full grid-cols-3 gap-3">
              <StatCard
                label="蛋白质"
                value={protein.toFixed(1)}
                unit="g"
                accentColor="purple"
                progress={{ current: protein, max: targets.proteinG || 1 }}
              />
              <StatCard
                label="碳水"
                value={carbs.toFixed(1)}
                unit="g"
                accentColor="warning"
                progress={{ current: carbs, max: targets.carbsG || 1 }}
              />
              <StatCard
                label="脂肪"
                value={fat.toFixed(1)}
                unit="g"
                accentColor="success"
                progress={{ current: fat, max: targets.fatG || 1 }}
              />
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground">
              蛋白质目标按 20%、碳水 50%、脂肪 30% 热量占比估算
            </p>
          </CardContent>
        </Card>

        {/* 餐食 + 最近添加 + AI 建议（桌面右栏，移动优先） */}
        <div className="stack lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <MealGroup
            logs={logs}
            onEdit={setEditingLogId}
            onDelete={(id) => void handleDelete(id)}
            collapsible
            title="今日饮食"
            onAddMeal={openAddSheet}
          />

          {recentFoods.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">最近添加</h2>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearRecentFoods}>
                    清除
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.map((food, index) => {
                    const key = `${food.foodName}-${index}`;
                    const isSaving = quickSavingId === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleQuickAdd(food as FoodLogFormData, key)}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/20 hover:bg-accent disabled:opacity-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{food.foodName}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">
                            {food.calories} kcal · P{food.proteinG} C{food.carbsG} F{food.fatG}
                          </p>
                        </div>
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {shouldShowAiAdvice && (
            <AiAdviceCard
              title="AI 今日建议"
              type="daily_diet"
              enabled={aiAdviceEnabled && logs.length > 0}
              disabledText={aiAdviceEnabled ? "记录一条饮食后，即可生成今日 AI 建议。" : "AI 建议已关闭，可在个人资料中开启。"}
              emptyText="暂无今日建议，点击生成后获取基于今日记录的饮食提示。"
            />
          )}
        </div>

        {/* 健康追踪（桌面左栏下部，移动靠后） */}
        <div className="grid gap-3 sm:grid-cols-2 lg:col-start-1 lg:row-start-2 lg:grid-cols-1">
          <WeightCard currentDate={currentDate} weightTargetKg={weightTargetKg} />
          <ExerciseCard currentDate={currentDate} onChanged={reload} />
          <WaterCard currentDate={currentDate} />
          <SleepCard currentDate={currentDate} />
        </div>
      </div>

      <QuickAddButton onClick={() => openAddSheet()} />

      <FoodLogEditorOverlay
        isOpenForAdd={showAddSheet}
        editingLog={editingLog}
        defaultMealType={addMealType}
        onAddSubmit={handleBatchSave}
        onEditSubmit={handleEditSave}
        onCloseAdd={() => setShowAddSheet(false)}
        onCloseEdit={() => setEditingLogId(null)}
      />
    </div>
  );
}
