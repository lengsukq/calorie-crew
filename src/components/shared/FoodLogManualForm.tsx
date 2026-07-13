"use client";

import { type FormEvent, useState } from "react";
import { mealTypes } from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import type { FoodLogFormData } from "@/shared/types";

interface FoodLogManualFormProps {
  initialValue: FoodLogFormData;
  onSubmit: (data: FoodLogFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

function normalizeNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : "0";
}

export function FoodLogManualForm({
  initialValue,
  onSubmit,
  onCancel,
  submitLabel = "保存修改",
}: FoodLogManualFormProps) {
  const [formData, setFormData] = useState<FoodLogFormData>(initialValue);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<FieldName extends keyof FoodLogFormData>(
    fieldName: FieldName,
    value: FoodLogFormData[FieldName],
  ) {
    setSubmitError(null);
    setFormData((previous) => ({ ...previous, [fieldName]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败，请稍后重试";
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="stack gap-1.5">
        <span className="glass-label">餐次</span>
        <select
          value={formData.mealType}
          onChange={(event) => updateField("mealType", event.target.value as FoodLogFormData["mealType"])}
          className="glass-select"
        >
          {mealTypes.map((type) => (
            <option key={type} value={type}>
              {MEAL_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="stack gap-1.5">
        <span className="glass-label">食物名称</span>
        <input
          value={formData.foodName}
          onChange={(event) => updateField("foodName", event.target.value)}
          className="glass-input"
          required
        />
      </label>

      <label className="stack gap-1.5">
        <span className="glass-label">份量</span>
        <input
          value={formData.servingDescription}
          onChange={(event) => updateField("servingDescription", event.target.value)}
          className="glass-input"
          required
        />
      </label>

      <label className="stack gap-1.5">
        <span className="glass-label">热量 (kcal)</span>
        <input
          value={normalizeNumber(formData.calories)}
          onChange={(event) => updateField("calories", Number(event.target.value))}
          className="glass-input"
          type="number"
          min="0"
          max="10000"
          required
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="stack gap-1.5">
          <span className="glass-label">蛋白质 (g)</span>
          <input
            value={normalizeNumber(formData.proteinG)}
            onChange={(event) => updateField("proteinG", Number(event.target.value))}
            className="glass-input"
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </label>
        <label className="stack gap-1.5">
          <span className="glass-label">碳水 (g)</span>
          <input
            value={normalizeNumber(formData.carbsG)}
            onChange={(event) => updateField("carbsG", Number(event.target.value))}
            className="glass-input"
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </label>
        <label className="stack gap-1.5">
          <span className="glass-label">脂肪 (g)</span>
          <input
            value={normalizeNumber(formData.fatG)}
            onChange={(event) => updateField("fatG", Number(event.target.value))}
            className="glass-input"
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </label>
      </div>

      {submitError && (
        <div className="glass-message-error text-sm" role="alert">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="glass-button">
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={`glass-button-primary ${onCancel ? "" : "col-span-2"}`}
        >
          {saving ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
