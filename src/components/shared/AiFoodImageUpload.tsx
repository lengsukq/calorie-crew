"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { recognizeFood } from "@/lib/api/ai-recognize";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import type { RecognizedFood } from "@/lib/api/ai-recognize";

interface AiFoodImageUploadProps {
  onRecognized: (food: RecognizedFood) => void;
}

function compressImage(file: File, maxSizeMB = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > 1024) {
        height = Math.round(height * (1024 / width));
        width = 1024;
      }
      if (height > 1024) {
        width = Math.round(width * (1024 / height));
        height = 1024;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const tryCompress = (quality: number) => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const sizeMB = (dataUrl.length * 0.75) / (1024 * 1024);

        if (sizeMB <= maxSizeMB || quality <= 0.1) {
          resolve(dataUrl.split(",")[1]);
        } else {
          tryCompress(quality - 0.1);
        }
      };

      tryCompress(0.9);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };

    img.src = url;
  });
}

export function AiFoodImageUpload({ onRecognized }: AiFoodImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<RecognizedFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片过大，请选择 10MB 以内的图片");
      return;
    }

    const previewReader = new FileReader();
    previewReader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    previewReader.readAsDataURL(file);
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const compressedBase64 = await compressImage(file, 3);
      const result = await recognizeFood(compressedBase64);

      if (result.foods && result.foods.length > 0) {
        setResults(result.foods);
        toast.success(`识别到 ${result.foods.length} 种食物`);
      } else {
        toast.error("未识别出食物，请换一张图片");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "识别失败";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleReset() {
    setPreviewUrl(null);
    setResults([]);
    setError(null);
  }

  return (
    <div className="space-y-3">
      {!previewUrl && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={() => {
              const input = fileInputRef.current;
              if (input) {
                input.setAttribute("capture", "environment");
                input.accept = "image/*";
                input.click();
              }
            }}
          >
            <Camera className="h-4 w-4" />
            拍照识别
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={() => {
              const input = fileInputRef.current;
              if (input) {
                input.removeAttribute("capture");
                input.accept = "image/*";
                input.click();
              }
            }}
          >
            <ImagePlus className="h-4 w-4" />
            上传图片
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
        </div>
      )}

      {previewUrl && (
        <div className="relative overflow-hidden rounded-lg border">
          <img src={previewUrl} alt="食物图片预览" className="max-h-48 w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2 h-7 gap-1"
            onClick={handleReset}
          >
            <RotateCcw className="h-3 w-3" />
            重选
          </Button>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium text-foreground">AI 识别中...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">识别结果（点击添加）</p>
          <div className="flex flex-wrap gap-2">
            {results.map((food, index) => (
              <button
                key={index}
                onClick={() => onRecognized(food)}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{food.foodName}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {food.servingDescription} · {food.calories} kcal
                  </p>
                </div>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  +添加
                </span>
              </button>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              清除结果
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
