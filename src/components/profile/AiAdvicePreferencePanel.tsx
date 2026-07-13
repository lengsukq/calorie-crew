"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { AI_ADVICE_FREQUENCY_LABELS } from "@/shared/constants";
import type { AiAdviceFrequency } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm">AI 建议偏好</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">开启 AI 建议</p>
            <p className="text-xs text-muted-foreground">关闭后将不会自动生成新的健康建议</p>
          </div>
          <input
            type="checkbox"
            checked={aiAdviceEnabled}
            onChange={(event) => setAiAdviceEnabled(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </label>

        <div className="space-y-1.5">
          <Label htmlFor="ai-frequency">建议频率</Label>
          <select
            id="ai-frequency"
            value={aiAdviceFrequency}
            onChange={(event) => setAiAdviceFrequency(event.target.value as AiAdviceFrequency)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={!aiAdviceEnabled}
          >
            {FREQUENCY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

        <Button type="button" onClick={() => void handleSave()} disabled={saving || loading} className="w-full">
          {saving ? "保存中..." : "保存偏好"}
        </Button>
      </CardContent>
    </Card>
  );
}
