"use client";

import { useState } from "react";
import { mealTypes } from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import { AiFoodImageUpload } from "@/components/shared/AiFoodImageUpload";
import { FoodSearch } from "@/components/shared/FoodSearch";
import { FoodItemList, type SelectedFood } from "@/components/shared/FoodItemList";
import type { FoodLogFormData } from "@/shared/types";
import type { FoodItem } from "@/hooks/useFoodSearch";
import type { RecognizedFood } from "@/lib/services/food-recognize.service";

interface FoodLogFormProps {
  onSubmit: (items: FoodLogFormData[]) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

let tempIdCounter = 0;
function nextTempId(): string {
  return `temp_${Date.now()}_${++tempIdCounter}`;
}

function recognizeToFormData(food: RecognizedFood): FoodLogFormData {
  return {
    mealType: "breakfast",
    foodName: food.foodName,
    servingDescription: food.servingDescription,
    calories: food.calories,
    proteinG: food.proteinG,
    carbsG: food.carbsG,
    fatG: food.fatG,
  };
}

function foodItemToFormData(food: FoodItem): FoodLogFormData {
  return {
    mealType: "breakfast",
    foodName: food.name,
    servingDescription: food.servingSize,
    calories: food.calories,
    proteinG: food.proteinG,
    carbsG: food.carbsG,
    fatG: food.fatG,
  };
}

export function FoodLogForm({ onSubmit, onCancel, submitLabel = "批量保存" }: FoodLogFormProps) {
  const [mealType, setMealType] = useState<string>("breakfast");
  const [items, setItems] = useState<SelectedFood[]>([]);
  const [saving, setSaving] = useState(false);

  function addItem(formData: FoodLogFormData) {
    setItems((prev) => [
      ...prev,
      { ...formData, mealType: mealType as FoodLogFormData["mealType"], tempId: nextTempId() },
    ]);
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  function updateServing(tempId: string, serving: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId ? { ...i, servingDescription: serving } : i,
      ),
    );
  }

  function handleAiUse(food: RecognizedFood) {
    addItem(recognizeToFormData(food));
  }

  function handleFoodSearchSelect(food: FoodItem) {
    addItem(foodItemToFormData(food));
  }

  async function handleSave() {
    if (items.length === 0) return;
    setSaving(true);
    try {
      // Remove tempId before submitting
      const data = items.map(({ tempId: _, ...rest }) => rest);
      await onSubmit(data);
      setItems([]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      {/* Meal type selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          餐次:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mealType === type
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-sm"
                  : "bg-white/50 text-slate-500 hover:bg-white/80"
              }`}
            >
              {MEAL_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* AI image upload */}
      <AiFoodImageUpload onRecognized={handleAiUse} />

      {/* Food database search */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            或从食物库搜索
          </span>
        </div>
        <FoodSearch onSelect={handleFoodSearchSelect} />
      </div>

      {/* Divider */}
      <div className="glass-divider !my-0" />

      {/* Selected items */}
      <FoodItemList
        items={items}
        onRemove={removeItem}
        onUpdateServing={updateServing}
      />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="glass-button">
            取消
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={items.length === 0 || saving}
          className={`glass-button-primary ${onCancel ? "" : "col-span-2"}`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="y2k-spinner !h-4 !w-4" />
              保存中...
            </span>
          ) : (
            `${submitLabel} (${items.length})`
          )}
        </button>
      </div>
    </div>
  );
}
