import { apiFetch } from "@/lib/api/client";
import type { EngagementData } from "@/shared/types";

export function fetchEngagement(): Promise<EngagementData> {
  return apiFetch<EngagementData>("/api/engagement");
}
