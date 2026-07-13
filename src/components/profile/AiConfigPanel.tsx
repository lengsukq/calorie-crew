"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot } from "lucide-react";
import { fetchAiConfig, saveAiConfig } from "@/lib/api/ai-config";
import { ApiError } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface AiConfigData {
  baseUrl: string | null;
  model: string | null;
  hasApiKey: boolean;
}

export function AiConfigPanel() {
  const [config, setConfig] = useState<AiConfigData>({
    baseUrl: null,
    model: null,
    hasApiKey: false,
  });
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAiConfig();
      setConfig(data);
      setBaseUrl(data.baseUrl ?? "");
      setModel(data.model ?? "");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  async function handleSave() {
    setSaving(true);
    try {
      const body: { baseUrl?: string; model?: string; apiKey?: string } = {};
      if (baseUrl !== (config.baseUrl ?? "")) body.baseUrl = baseUrl;
      if (model !== (config.model ?? "")) body.model = model;
      if (apiKey) body.apiKey = apiKey;

      if (Object.keys(body).length === 0) {
        toast.error("没有要保存的修改");
        return;
      }

      await saveAiConfig(body);

      toast.success("AI 配置已保存");
      setApiKey("");
      await loadConfig();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "保存失败";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const hasUnsaved =
    baseUrl !== (config.baseUrl ?? "") ||
    model !== (config.model ?? "") ||
    apiKey.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <Bot className="h-4 w-4 text-primary" />
        <CardTitle className="text-sm">AI 识别设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Skeleton className="h-5 w-5" />
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="ai-base-url">API 地址</Label>
              <Input
                id="ai-base-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.siliconflow.cn/v1/chat/completions"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-model">模型</Label>
              <Input
                id="ai-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Qwen/Qwen3.5-4B"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-key">
                API 密钥
                {config.hasApiKey && (
                  <span className="ml-2 text-[10px] font-normal text-emerald-600">(已配置，留空则保持原值)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="ai-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={config.hasApiKey ? "输入新密钥以替换" : "sk-..."}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 text-xs text-muted-foreground"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "隐藏" : "显示"}
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              留空则使用系统默认配置。除了已启用的 API 密钥外，其他用户均不可见。
            </p>

            <Button onClick={handleSave} disabled={saving || !hasUnsaved} className="w-full">
              {saving ? "保存中..." : "保存配置"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
