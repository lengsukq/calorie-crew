"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { mealTypes } from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import { AiFoodImageUpload } from "@/components/shared/AiFoodImageUpload";
import { FoodSearch } from "@/components/shared/FoodSearch";
import { FoodItemList, type SelectedFood } from "@/components/shared/FoodItemList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FoodLogFormData } from "@/shared/types";
import type { FoodItem } from "@/hooks/useFoodSearch";
import type { RecognizedFood } from "@/lib/services/food-recognize.service";

interface FoodLogFormProps {
  onSubmit: (items: FoodLogFormData[]) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  defaultMealType?: string;
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

export function FoodLogForm({ onSubmit, onCancel, submitLabel = "批量保存", defaultMealType = "breakfast" }: FoodLogFormProps) {
  const [mealType, setMealType] = useState<string>(defaultMealType);
  const [items, setItems] = useState<SelectedFood[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addItem(formData: FoodLogFormData) {
    setSubmitError(null);
    setItems((prev) => [
      ...prev,
      { ...formData, mealType: mealType as FoodLogFormData["mealType"], tempId: nextTempId() },
    ]);
  }

  function removeItem(tempId: string) {
    setSubmitError(null);
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  function updateServing(tempId: string, serving: string) {
    setSubmitError(null);
    setItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, servingDescription: serving } : i)),
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
    setSubmitError(null);
    try {
      const data = items.map(({ tempId: _tempId, ...rest }) => rest);
      await onSubmit(data);
      setItems([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败，请稍后重试";
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">餐次</span>
          <div className="flex flex-wrap gap-1.5">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  mealType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {MEAL_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <AiFoodImageUpload onRecognized={handleAiUse} />

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">或从食物库搜索</span>
          <FoodSearch onSelect={handleFoodSearchSelect} />
        </div>

        <div className="border-t" />

        <FoodItemList items={items} onRemove={removeItem} onUpdateServing={updateServing} />
        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 pt-3">
        <div className="grid grid-cols-2 gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={items.length === 0 || saving}
            className={onCancel ? "" : "col-span-2"}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "保存中..." : `${submitLabel} (${items.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
