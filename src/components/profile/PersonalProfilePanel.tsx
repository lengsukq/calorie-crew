"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import {
  ACTIVITY_LEVEL_LABELS,
  AI_ADVICE_FREQUENCY_LABELS,
  HEALTH_GOAL_LABELS,
  PROFILE_GENDER_LABELS,
} from "@/shared/constants";
import type { ActivityLevel, AiAdviceFrequency, HealthGoal, ProfileGender } from "@/lib/db/schema";
import type { UserProfileData, UserProfileFormData } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const GENDER_OPTIONS = Object.entries(PROFILE_GENDER_LABELS) as Array<[ProfileGender, string]>;
const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_LEVEL_LABELS) as Array<[ActivityLevel, string]>;
const HEALTH_GOAL_OPTIONS = Object.entries(HEALTH_GOAL_LABELS) as Array<[HealthGoal, string]>;
const AI_FREQUENCY_OPTIONS = Object.entries(AI_ADVICE_FREQUENCY_LABELS) as Array<[AiAdviceFrequency, string]>;

interface PersonalProfilePanelProps {
  onSaved?: () => void;
}

function profileToFormData(profile: UserProfileData): Required<UserProfileFormData> {
  return {
    displayName: profile.displayName ?? "",
    birthDate: profile.birthDate ?? "",
    gender: profile.gender,
    heightCm: profile.heightCm,
    activityLevel: profile.activityLevel,
    healthGoal: profile.healthGoal,
    weightTargetKg: profile.weightTargetKg ? Number(profile.weightTargetKg) : null,
    waterTargetMl: profile.waterTargetMl,
    sleepTargetMinutes: profile.sleepTargetMinutes,
    aiAdviceEnabled: profile.aiAdviceEnabled,
    aiAdviceFrequency: profile.aiAdviceFrequency,
  };
}

export function PersonalProfilePanel({ onSaved }: PersonalProfilePanelProps) {
  const { data, loading, saving, error, updateProfile } = useProfile();
  const [formData, setFormData] = useState<Required<UserProfileFormData> | null>(null);

  useEffect(() => {
    if (data?.profile) {
      setFormData(profileToFormData(data.profile));
    }
  }, [data]);

  async function handleSave() {
    if (!formData) return;

    try {
      await updateProfile({
        ...formData,
        displayName: formData.displayName?.trim() || null,
        birthDate: formData.birthDate || null,
        heightCm: formData.heightCm || null,
        weightTargetKg: formData.weightTargetKg || null,
      });
      toast.success("个人档案已保存");
      onSaved?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存个人档案失败";
      toast.error(message);
    }
  }

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center py-6">
        <Skeleton className="h-5 w-5" />
        <span className="ml-2 text-sm text-muted-foreground">正在加载个人档案...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="display-name">显示名称</Label>
          <Input
            id="display-name"
            value={formData.displayName ?? ""}
            onChange={(event) => setFormData({ ...formData, displayName: event.target.value })}
            placeholder="可选"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birth-date">出生日期</Label>
          <Input
            id="birth-date"
            type="date"
            value={formData.birthDate ?? ""}
            onChange={(event) => setFormData({ ...formData, birthDate: event.target.value })}
          />
        </div>

        <SelectField
          label="性别"
          value={formData.gender}
          options={GENDER_OPTIONS}
          onChange={(value) => setFormData({ ...formData, gender: value })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="height">身高（cm）</Label>
          <Input
            id="height"
            type="number"
            min="80"
            max="260"
            value={formData.heightCm ?? ""}
            onChange={(event) => setFormData({ ...formData, heightCm: event.target.value ? Number(event.target.value) : null })}
            placeholder="例如 175"
          />
        </div>

        <SelectField
          label="活动水平"
          value={formData.activityLevel}
          options={ACTIVITY_OPTIONS}
          onChange={(value) => setFormData({ ...formData, activityLevel: value })}
        />

        <SelectField
          label="健康目标"
          value={formData.healthGoal}
          options={HEALTH_GOAL_OPTIONS}
          onChange={(value) => setFormData({ ...formData, healthGoal: value })}
        />

        <div className="space-y-1.5">
          <Label htmlFor="weight-target">目标体重（kg）</Label>
          <Input
            id="weight-target"
            type="number"
            min="20"
            max="500"
            step="0.1"
            value={formData.weightTargetKg ?? ""}
            onChange={(event) => setFormData({ ...formData, weightTargetKg: event.target.value ? Number(event.target.value) : null })}
            placeholder="可选"
          />
        </div>

        <SelectField
          label="AI 建议频率"
          value={formData.aiAdviceFrequency}
          options={AI_FREQUENCY_OPTIONS}
          onChange={(value) => setFormData({ ...formData, aiAdviceFrequency: value, aiAdviceEnabled: value !== "off" })}
        />
      </div>

      <label className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">开启 AI 建议</p>
          <p className="text-xs text-muted-foreground">关闭后不会自动生成新的健康建议</p>
        </div>
        <input
          type="checkbox"
          checked={formData.aiAdviceEnabled}
          onChange={(event) => setFormData({
            ...formData,
            aiAdviceEnabled: event.target.checked,
            aiAdviceFrequency: event.target.checked ? formData.aiAdviceFrequency : "off",
          })}
          className="h-4 w-4 accent-primary"
        />
      </label>

      <Button type="button" onClick={() => void handleSave()} disabled={saving} className="w-full">
        {saving ? "保存中..." : "保存个人档案"}
      </Button>
    </div>
  );
}

function SelectField<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: TValue;
  options: Array<[TValue, string]>;
  onChange: (value: TValue) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`select-${label}`}>{label}</Label>
      <select
        id={`select-${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </div>
  );
}
