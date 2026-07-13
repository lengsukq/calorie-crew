"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Engine = "siliconflow" | "boohee";

interface AiConfigData {
  engine: Engine;
  baseUrl: string | null;
  model: string | null;
  hasApiKey: boolean;
}

export function AiConfigPanel() {
  const [config, setConfig] = useState<AiConfigData>({
    engine: "siliconflow",
    baseUrl: null,
    model: null,
    hasApiKey: false,
  });
  const [engine, setEngine] = useState<Engine>("siliconflow");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/config");
      const data = (await response.json()) as AiConfigData;
      setConfig(data);
      setEngine(data.engine ?? "siliconflow");
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
      const body: Record<string, string> = {};
      body.engine = engine;

      if (engine === "siliconflow") {
        if (baseUrl !== (config.baseUrl ?? "")) body.baseUrl = baseUrl;
        if (model !== (config.model ?? "")) body.model = model;
      }
      if (apiKey) body.apiKey = apiKey;

      if (Object.keys(body).length === 0) {
        toast.error("没有要保存的修改");
        return;
      }

      const response = await fetch("/api/ai/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      toast.success("AI 配置已保存");
      setApiKey("");
      await loadConfig();
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  }

  const hasUnsaved =
    engine !== config.engine ||
    (engine === "siliconflow" && (baseUrl !== (config.baseUrl ?? "") || model !== (config.model ?? ""))) ||
    apiKey.length > 0;

  return (
    <div className="glass-card">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base">🤖</span>
        <span className="text-sm font-semibold text-slate-700">AI 识别设置</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="y2k-spinner h-5 w-5" />
        </div>
      ) : (
        <div className="stack gap-4">
          {/* Engine switch */}
          <div>
            <span className="glass-label">识别引擎</span>
            <div className="mt-1.5 flex gap-2">
              <EngineTab
                label="SiliconFlow (LLM)"
                active={engine === "siliconflow"}
                onClick={() => setEngine("siliconflow")}
              />
              <EngineTab
                label="Boohee (薄荷)"
                active={engine === "boohee"}
                onClick={() => setEngine("boohee")}
              />
            </div>
          </div>

          {/* SiliconFlow config */}
          {engine === "siliconflow" && (
            <>
              <label className="stack gap-1">
                <span className="glass-label">API 地址</span>
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="glass-input"
                  placeholder="https://api.siliconflow.cn/v1/chat/completions"
                />
              </label>

              <label className="stack gap-1">
                <span className="glass-label">模型</span>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="glass-input"
                  placeholder="Qwen/Qwen2.5-VL-72B-Instruct"
                />
              </label>
            </>
          )}

          {/* Boohee config */}
          {engine === "boohee" && (
            <div className="rounded-xl bg-amber-50/50 px-4 py-3 text-xs text-slate-500 leading-relaxed">
              Boohee 模式使用固定 API 地址 <code className="text-cyan-700">api.boohee.com/open-apis</code>
              ，只需配置 API 密钥即可。
            </div>
          )}

          {/* API Key (shared) */}
          <label className="stack gap-1">
            <span className="glass-label">
              API 密钥
              {config.hasApiKey && (
                <span className="ml-2 text-[10px] font-normal text-emerald-500">
                  (已配置，留空则保持原值)
                </span>
              )}
            </span>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="glass-input pr-10"
                placeholder={config.hasApiKey ? "输入新密钥以替换" : "sk-..."}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                aria-label={showKey ? "隐藏密钥" : "显示密钥"}
              >
                {showKey ? "隐藏" : "显示"}
              </button>
            </div>
          </label>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            留空则使用系统默认配置。除了已启用的 API 密钥外，其他用户均不可见。
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsaved}
              className="glass-button-primary !px-5 !py-2 text-sm"
            >
              {saving ? "保存中..." : "保存配置"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EngineTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-sm"
          : "bg-white/50 text-slate-500 hover:bg-white/80"
      }`}
    >
      {label}
    </button>
  );
}
