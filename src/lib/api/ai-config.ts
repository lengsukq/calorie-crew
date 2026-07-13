import { apiFetch } from "@/lib/api/client";

export interface AiConfig {
  baseUrl: string | null;
  model: string | null;
  hasApiKey: boolean;
}

export interface SaveAiConfigInput {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
}

interface SaveAiConfigResponse {
  success: boolean;
}

export function fetchAiConfig(): Promise<AiConfig> {
  return apiFetch<AiConfig>("/api/ai/config");
}

export function saveAiConfig(data: SaveAiConfigInput): Promise<SaveAiConfigResponse> {
  return apiFetch<SaveAiConfigResponse>("/api/ai/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
