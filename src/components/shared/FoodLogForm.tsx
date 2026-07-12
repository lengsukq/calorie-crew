"use client";

import { useRef, type FormEvent } from "react";
import { mealTypes } from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import { AiFoodRecognizer } from "@/components/shared/AiFoodRecognizer";
import type { FoodLogFormData } from "@/shared/types";
import type { RecognizedFood } from "@/lib/services/food-recognize.service";

interface FoodLogFormProps {
  onSubmit: (data: FoodLogFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  showAi?: boolean;
}

export function FoodLogForm({ onSubmit, onCancel, submitLabel = "保存记录", showAi = true }: FoodLogFormProps) {
  const foodNameRef = useRef<HTMLInputElement>(null);
  const servingRef = useRef<HTMLInputElement>(null);
  const caloriesRef = useRef<HTMLInputElement>(null);
  const proteinRef = useRef<HTMLInputElement>(null);
  const carbsRef = useRef<HTMLInputElement>(null);
  const fatRef = useRef<HTMLInputElement>(null);

  function handleAiUse(food: RecognizedFood) {
    if (foodNameRef.current) foodNameRef.current.value = food.foodName;
    if (servingRef.current) servingRef.current.value = food.servingDescription;
    if (caloriesRef.current) caloriesRef.current.value = String(food.calories);
    if (proteinRef.current) proteinRef.current.value = String(food.proteinG);
    if (carbsRef.current) carbsRef.current.value = String(food.carbsG);
    if (fatRef.current) fatRef.current.value = String(food.fatG);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const data: FoodLogFormData = {
      mealType: form.get("mealType") as FoodLogFormData["mealType"],
      foodName: form.get("foodName") as string,
      servingDescription: (form.get("servingDescription") as string) ?? "",
      calories: Number(form.get("calories")),
      proteinG: Number(form.get("proteinG")) || 0,
      carbsG: Number(form.get("carbsG")) || 0,
      fatG: Number(form.get("fatG")) || 0,
    };

    await onSubmit(data);
    (event.target as HTMLFormElement).reset();
  }

  return (
    <div className="stack">
      {/* AI Recognition section */}
      {showAi && <AiFoodRecognizer onUseFood={handleAiUse} />}

      {/* Glass divider */}
      {showAi && <div className="glass-divider !my-0" />}

      {/* Manual form */}
      <form className="stack" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="stack gap-1.5">
            <span className="glass-label">餐次</span>
            <select name="mealType" defaultValue="" required className="glass-select">
              <option value="" disabled>选择餐次</option>
              {mealTypes.map((type) => (
                <option key={type} value={type}>{MEAL_LABELS[type]}</option>
              ))}
            </select>
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">食物</span>
            <input name="foodName" ref={foodNameRef} required className="glass-input" placeholder="例如：米饭" />
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">份量</span>
            <input name="servingDescription" ref={servingRef} className="glass-input" placeholder="1 碗" />
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">热量 (kcal)</span>
            <input name="calories" ref={caloriesRef} type="number" min="0" required className="glass-input" placeholder="200" />
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">蛋白质 (g)</span>
            <input name="proteinG" ref={proteinRef} type="number" min="0" step="0.01" defaultValue="0" className="glass-input" />
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">碳水 (g)</span>
            <input name="carbsG" ref={carbsRef} type="number" min="0" step="0.01" defaultValue="0" className="glass-input" />
          </label>
          <label className="stack gap-1.5">
            <span className="glass-label">脂肪 (g)</span>
            <input name="fatG" ref={fatRef} type="number" min="0" step="0.01" defaultValue="0" className="glass-input" />
          </label>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="glass-button">
              取消
            </button>
          )}
          <button
            type="submit"
            className={`glass-button-primary ${onCancel ? "" : "col-span-2"}`}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
