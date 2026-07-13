"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { RecognizedFood } from "@/lib/services/food-recognize.service";

interface AiFoodImageUploadProps {
  onRecognized: (food: RecognizedFood) => void;
}

export function AiFoodImageUpload({ onRecognized }: AiFoodImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<RecognizedFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelected(file: File | undefined) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片过大，请选择 10MB 以内的图片");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      void recognizeImage(dataUrl, file.type);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function recognizeImage(dataUrl: string, mimeType: string) {
    const base64 = dataUrl.split(",")[1];
    if (!base64) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/ai/recognize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
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
        toast.error("未识别出食物，请换一张图片");
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
    onRecognized(food);
  }

  function handleReset() {
    setPreviewUrl(null);
    setResults([]);
    setError(null);
  }

  return (
    <div className="stack gap-3">
      {/* Upload buttons */}
      {!previewUrl && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Request camera access
              const input = fileInputRef.current;
              if (input) {
                input.capture = "environment" as string;
                input.accept = "image/*";
                input.click();
              }
            }}
            disabled={loading}
            className="glass-button !flex-1 !gap-2 !px-4 !py-3 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            拍照识别
          </button>
          <button
            onClick={() => {
              const input = fileInputRef.current;
              if (input) {
                input.removeAttribute("capture");
                input.accept = "image/*";
                input.click();
              }
            }}
            disabled={loading}
            className="glass-button !flex-1 !gap-2 !px-4 !py-3 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            上传图片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Preview + reload */}
      {previewUrl && (
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={previewUrl}
            alt="食物图片预览"
            className="max-h-48 w-full object-cover"
          />
          <button
            onClick={handleReset}
            className="absolute right-2 top-2 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            重新选择
          </button>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg">
                <span className="y2k-spinner !h-4 !w-4 !border-slate-300 !border-t-cyan-500" />
                <span className="text-xs font-medium text-slate-600">AI 识别中...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="stack gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            识别结果（点击添加至列表）
          </p>
          <div className="flex flex-wrap gap-2">
            {results.map((food, index) => (
              <button
                key={index}
                onClick={() => handleUse(food)}
                className="list-item !inline-flex !w-auto !items-center !gap-2 !px-3 !py-2 transition-all hover:border-cyan-200 hover:shadow-sm"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700">{food.foodName}</p>
                  <p className="text-[10px] text-slate-400">
                    {food.servingDescription} · {food.calories} kcal
                  </p>
                </div>
                <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-600">
                  +添加
                </span>
              </button>
            ))}
            <button
              onClick={handleReset}
              className="rounded-lg px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-red-500"
            >
              清除结果
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-message-error text-xs" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
