"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { RecognizedFood } from "@/lib/services/food-recognize.service";

interface AiFoodRecognizerProps {
  onUseFood: (food: RecognizedFood) => void;
}

export function AiFoodRecognizer({ onUseFood }: AiFoodRecognizerProps) {
  const [description, setDescription] = useState("");
  const [results, setResults] = useState<RecognizedFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecognize() {
    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("请描述你吃了什么");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/ai/recognize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });

      const result = (await response.json()) as {
        foods?: RecognizedFood[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "识别失败");
      }

      if (result.foods && result.foods.length > 0) {
        setResults(result.foods);
        toast.success(`识别到 ${result.foods.length} 种食物`);
      } else {
        toast.error("未识别出食物，请换一种描述");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "识别失败";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleUse(food: RecognizedFood) {
    onUseFood(food);
    setDescription("");
    setResults([]);
    setError(null);
    toast.success(`已使用: ${food.foodName}`);
  }

  function handleCancel() {
    setDescription("");
    setResults([]);
    setError(null);
  }

  return (
    <div className="stack gap-3">
      {/* AI Food description input */}
      <div className="flex items-stretch gap-2">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleRecognize();
            }
          }}
          className="glass-input flex-1"
          placeholder="描述你吃了什么，例如：一碗米饭和一份红烧肉"
          disabled={loading}
        />
        <button
          onClick={handleRecognize}
          disabled={loading || !description.trim()}
          className="glass-button-primary !rounded-xl !px-4 !py-2 whitespace-nowrap text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="y2k-spinner !h-4 !w-4" />
              识别中
            </span>
          ) : (
            "AI 识别"
          )}
        </button>
      </div>

      {/* Results list */}
      {results.length > 0 && (
        <div className="stack gap-2">
          <p className="text-xs font-semibold text-slate-500">识别结果（点击「使用」自动填写）</p>
          {results.map((food, index) => (
            <div
              key={index}
              className="list-item !py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {food.foodName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {food.servingDescription}
                    {" · "}
                    {food.calories} kcal
                    {" · P:"}
                    {food.proteinG}g
                    {" C:"}
                    {food.carbsG}g
                    {" F:"}
                    {food.fatG}g
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleUse(food)}
                    className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => {
                      setResults((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="rounded-lg bg-white/50 px-2 py-1.5 text-xs text-slate-400 transition-colors hover:text-red-500"
                  >
                    忽略
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={handleCancel}
            className="text-xs text-slate-400 hover:text-slate-600 self-end transition-colors"
          >
            清除全部
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="glass-message-error text-xs" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
