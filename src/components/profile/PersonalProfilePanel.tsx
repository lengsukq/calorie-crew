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
      <div className="glass-card flex items-center justify-center py-6">
        <span className="y2k-spinner h-5 w-5" />
        <span className="ml-2 text-sm text-slate-400">正在加载个人档案...</span>
      </div>
    );
  }

  return (
    <div className="stack gap-4">
      {error && <p className="glass-message-error text-sm">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="stack gap-1">
          <span className="glass-label">显示名称</span>
          <input
            value={formData.displayName ?? ""}
            onChange={(event) => setFormData({ ...formData, displayName: event.target.value })}
            className="glass-input"
            placeholder="可选"
          />
        </label>

        <label className="stack gap-1">
          <span className="glass-label">出生日期</span>
          <input
            type="date"
            value={formData.birthDate ?? ""}
            onChange={(event) => setFormData({ ...formData, birthDate: event.target.value })}
            className="glass-input"
          />
        </label>

        <SelectField
          label="性别"
          value={formData.gender}
          options={GENDER_OPTIONS}
          onChange={(value) => setFormData({ ...formData, gender: value })}
        />

        <label className="stack gap-1">
          <span className="glass-label">身高（cm）</span>
          <input
            type="number"
            min="80"
            max="260"
            value={formData.heightCm ?? ""}
            onChange={(event) => setFormData({ ...formData, heightCm: event.target.value ? Number(event.target.value) : null })}
            className="glass-input"
            placeholder="例如 175"
          />
        </label>

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

        <label className="stack gap-1">
          <span className="glass-label">目标体重（kg）</span>
          <input
            type="number"
            min="20"
            max="500"
            step="0.1"
            value={formData.weightTargetKg ?? ""}
            onChange={(event) => setFormData({ ...formData, weightTargetKg: event.target.value ? Number(event.target.value) : null })}
            className="glass-input"
            placeholder="可选"
          />
        </label>

        <SelectField
          label="AI 建议频率"
          value={formData.aiAdviceFrequency}
          options={AI_FREQUENCY_OPTIONS}
          onChange={(value) => setFormData({ ...formData, aiAdviceFrequency: value, aiAdviceEnabled: value !== "off" })}
        />
      </div>

      <label className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">开启 AI 建议</p>
          <p className="text-xs text-slate-400">关闭后不会自动生成新的健康建议</p>
        </div>
        <input
          type="checkbox"
          checked={formData.aiAdviceEnabled}
          onChange={(event) => setFormData({
            ...formData,
            aiAdviceEnabled: event.target.checked,
            aiAdviceFrequency: event.target.checked ? formData.aiAdviceFrequency : "off",
          })}
          className="h-5 w-5 accent-cyan-500"
        />
      </label>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="glass-button-primary w-full"
      >
        {saving ? "保存中..." : "保存个人档案"}
      </button>
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
    <label className="stack gap-1">
      <span className="glass-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className="glass-input"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}
