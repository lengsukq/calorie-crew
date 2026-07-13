import { apiFetch } from "@/lib/api/client";
import type { AiAdviceData } from "@/shared/types";
import type { AiAdviceType } from "@/lib/db/schema";

interface AiAdviceListResponse {
  advices: AiAdviceData[];
}

export function fetchAiAdvices(type?: AiAdviceType, range: "7d" | "30d" | "90d" = "7d"): Promise<AiAdviceListResponse> {
  const searchParams = new URLSearchParams({ range });
  if (type) searchParams.set("type", type);
  return apiFetch<AiAdviceListResponse>(`/api/ai/advice?${searchParams.toString()}`);
}

export function generateAiAdvice(type: AiAdviceType, force = false): Promise<AiAdviceData> {
  return apiFetch<AiAdviceData>("/api/ai/advice/generate", {
    method: "POST",
    body: JSON.stringify({ type, force }),
  });
}

export function deleteAiAdvice(id: string): Promise<void> {
  return apiFetch<void>(`/api/ai/advice/${id}`, { method: "DELETE" });
}

export function feedbackAiAdvice(id: string, feedback: "helpful" | "not_helpful"): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/ai/advice/${id}/feedback`, {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}

export function completeAiAdvice(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/ai/advice/${id}/complete`, {
    method: "POST",
  });
}

export function dismissAiAdvice(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/ai/advice/${id}/dismiss`, {
    method: "POST",
  });
}

export function fetchAiAdviceHistory(type?: AiAdviceType, range: "7d" | "30d" | "90d" = "30d"): Promise<AiAdviceListResponse> {
  const searchParams = new URLSearchParams({ range });
  if (type) searchParams.set("type", type);
  return apiFetch<AiAdviceListResponse>(`/api/ai/advice/history?${searchParams.toString()}`);
}

export function reactivateAiAdvice(id: string): Promise<{ advice: AiAdviceData }> {
  return apiFetch<{ advice: AiAdviceData }>(`/api/ai/advice/${id}/reactivate`, {
    method: "POST",
  });
}
