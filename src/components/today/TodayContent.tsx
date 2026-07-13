"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSummary } from "@/hooks/useSummary";
import { CalorieRing } from "@/components/today/CalorieRing";
import { MealGroup } from "@/components/today/MealGroup";
import { FoodLogForm } from "@/components/shared/FoodLogForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { todayDate } from "@/lib/api/client";
import type { FoodLogFormData } from "@/shared/types";

const RECENT_FOODS_KEY = "calorie_crew_recent_foods";
const MAX_RECENT = 5;

interface TodayContentProps {
  email: string;
  role: string;
  calorieTarget: number;
}

export function TodayContent({ email, role, calorieTarget }: TodayContentProps) {
  const { logs, summary, reload } = useSummary({ date: todayDate() });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [recentFoods, setRecentFoods] = useState<FoodLogFormData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_FOODS_KEY);
      if (raw) setRecentFoods(JSON.parse(raw) as FoodLogFormData[]);
    } catch {
      // ignore
    }
  }, []);

  async function handleBatchSave(items: FoodLogFormData[]) {
    try {
      const response = await fetch("/api/food-logs/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ logs: items }),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        toast.error(err.error ?? "保存失败");
        return;
      }
      setShowAddSheet(false);
      toast.success(`已保存 ${items.length} 条记录`);
      await reload();

      // Update recent foods
      const names = items.map((i) => ({
        mealType: i.mealType,
        foodName: i.foodName,
        servingDescription: i.servingDescription,
        calories: i.calories,
        proteinG: i.proteinG,
        carbsG: i.carbsG,
        fatG: i.fatG,
      }));
      const existing = [...names, ...recentFoods].slice(0, MAX_RECENT);
      setRecentFoods(existing);
      localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(existing));
    } catch {
      toast.error("保存失败");
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/food-logs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error("删除失败");
        return;
      }
      toast.success("已删除");
      await reload();
    } catch {
      toast.error("删除失败");
    }
  }

  const totalKcal = summary?.totalKcal ?? 0;
  const protein = parseFloat(summary?.totalProteinG ?? "0");
  const carbs = parseFloat(summary?.totalCarbsG ?? "0");
  const fat = parseFloat(summary?.totalFatG ?? "0");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="stack page-enter">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{email}</p>
          <h2 className="mt-0.5 text-xl font-bold text-slate-800">
            {greeting}，今天吃得怎么样？
          </h2>
        </div>
        <span className="glass-tag">{role}</span>
      </div>

      <div className="glass-card flex flex-col items-center">
        <CalorieRing current={totalKcal} target={calorieTarget} />
        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          <MacroItem label="蛋白质" value={protein} unit="g" gradient="from-purple-400 to-pink-500" />
          <MacroItem label="碳水" value={carbs} unit="g" gradient="from-amber-400 to-orange-500" />
          <MacroItem label="脂肪" value={fat} unit="g" gradient="from-teal-400 to-emerald-500" />
        </div>
      </div>

      <button
        onClick={() => setShowAddSheet(true)}
        className="glass-button-primary w-full"
      >
        + 快速记录
      </button>

      {recentFoods.length > 0 && (
        <div className="glass-card">
          <h2 className="mb-3 text-sm font-bold text-slate-800">最近添加</h2>
          <div className="flex flex-wrap gap-2">
            {recentFoods.map((food, index) => (
              <span
                key={index}
                className="list-item !inline-flex !w-auto !items-center !gap-2 !px-3 !py-2"
              >
                <span className="text-sm font-medium text-slate-700">{food.foodName}</span>
                <span className="text-xs text-slate-400">{food.calories} kcal</span>
              </span>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem(RECENT_FOODS_KEY);
                setRecentFoods([]);
              }}
              className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      )}

      <MealGroup logs={logs} onDelete={handleDelete} />

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
    </div>
  );
}

function MacroItem({
  label,
  value,
  unit,
  gradient,
}: {
  label: string;
  value: number;
  unit: string;
  gradient: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/40 px-3 py-3 backdrop-blur-sm">
      <div className={`icon-box !h-9 !w-9 !rounded-lg bg-gradient-to-br ${gradient}`}>
        <span className="text-sm">
          {label === "蛋白质" ? "🥩" : label === "碳水" ? "🍚" : "🧈"}
        </span>
      </div>
      <span className="text-lg font-bold text-slate-700">
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </span>
      <span className="text-[10px] font-medium text-slate-400">{label}</span>
    </div>
  );
}
