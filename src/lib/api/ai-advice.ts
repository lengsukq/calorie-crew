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
