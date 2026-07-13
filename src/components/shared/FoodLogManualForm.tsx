"use client";

import { type FormEvent, useState } from "react";
import { mealTypes } from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import type { FoodLogFormData } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="mealType">餐次</Label>
        <select
          id="mealType"
          value={formData.mealType}
          onChange={(event) => updateField("mealType", event.target.value as FoodLogFormData["mealType"])}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {mealTypes.map((type) => (
            <option key={type} value={type}>
              {MEAL_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="foodName">食物名称</Label>
        <Input
          id="foodName"
          value={formData.foodName}
          onChange={(event) => updateField("foodName", event.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="servingDescription">份量</Label>
        <Input
          id="servingDescription"
          value={formData.servingDescription}
          onChange={(event) => updateField("servingDescription", event.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="calories">热量 (kcal)</Label>
        <Input
          id="calories"
          value={normalizeNumber(formData.calories)}
          onChange={(event) => updateField("calories", Number(event.target.value))}
          type="number"
          min="0"
          max="10000"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="proteinG">蛋白质 (g)</Label>
          <Input
            id="proteinG"
            value={normalizeNumber(formData.proteinG)}
            onChange={(event) => updateField("proteinG", Number(event.target.value))}
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="carbsG">碳水 (g)</Label>
          <Input
            id="carbsG"
            value={normalizeNumber(formData.carbsG)}
            onChange={(event) => updateField("carbsG", Number(event.target.value))}
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fatG">脂肪 (g)</Label>
          <Input
            id="fatG"
            value={normalizeNumber(formData.fatG)}
            onChange={(event) => updateField("fatG", Number(event.target.value))}
            type="number"
            min="0"
            max="1000"
            step="0.01"
          />
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={saving} className={onCancel ? "" : "col-span-2"}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
