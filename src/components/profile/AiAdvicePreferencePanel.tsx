"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { AI_ADVICE_FREQUENCY_LABELS } from "@/shared/constants";
import type { AiAdviceFrequency } from "@/lib/db/schema";

const FREQUENCY_OPTIONS = Object.entries(AI_ADVICE_FREQUENCY_LABELS) as Array<[AiAdviceFrequency, string]>;

export function AiAdvicePreferencePanel() {
  const { data, loading, saving, error, updateProfile } = useProfile();
  const [aiAdviceEnabled, setAiAdviceEnabled] = useState(true);
  const [aiAdviceFrequency, setAiAdviceFrequency] = useState<AiAdviceFrequency>("daily");

  useEffect(() => {
    if (data?.profile) {
      setAiAdviceEnabled(data.profile.aiAdviceEnabled);
      setAiAdviceFrequency(data.profile.aiAdviceFrequency);
    }
  }, [data]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        aiAdviceEnabled,
        aiAdviceFrequency: aiAdviceEnabled ? aiAdviceFrequency : "off",
      });
      toast.success("AI 建议偏好已保存");
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存 AI 偏好失败";
      toast.error(message);
    }
  }, [aiAdviceEnabled, aiAdviceFrequency, updateProfile]);

  return (
    <div className="stack gap-3">
      <div className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">开启 AI 建议</p>
          <p className="text-xs text-slate-400">关闭后将不会自动生成新的健康建议</p>
        </div>
        <input
          type="checkbox"
          checked={aiAdviceEnabled}
          onChange={(event) => setAiAdviceEnabled(event.target.checked)}
          className="h-5 w-5 accent-cyan-500"
        />
      </div>

      <label className="stack gap-1">
        <span className="glass-label">建议频率</span>
        <select
          value={aiAdviceFrequency}
          onChange={(event) => setAiAdviceFrequency(event.target.value as AiAdviceFrequency)}
          className="glass-input"
          disabled={!aiAdviceEnabled}
        >
          {FREQUENCY_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || loading}
        className="glass-button-primary w-full"
      >
        {saving ? "保存中..." : "保存偏好"}
      </button>
    </div>
  );
}
