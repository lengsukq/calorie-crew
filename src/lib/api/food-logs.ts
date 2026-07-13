import { apiFetch } from "@/lib/api/client";
import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

interface FoodLogsResponse {
  logs: FoodLogEntry[];
}

interface CreateLogResponse {
  log: FoodLogEntry;
}

interface UpdateLogResponse {
  log: FoodLogEntry;
}

export function fetchFoodLogsByDate(date: string): Promise<FoodLogsResponse> {
  return apiFetch<FoodLogsResponse>(`/api/food-logs?date=${encodeURIComponent(date)}`);
}

export function createFoodLog(
  logDate: string,
  data: FoodLogFormData,
): Promise<CreateLogResponse> {
  return apiFetch<CreateLogResponse>("/api/food-logs", {
    method: "POST",
    body: JSON.stringify({ logDate, ...data }),
  });
}

export function deleteFoodLog(id: string): Promise<void> {
  return apiFetch<void>(`/api/food-logs/${id}`, { method: "DELETE" });
}

export function updateFoodLog(
  id: string,
  logDate: string,
  data: FoodLogFormData,
): Promise<UpdateLogResponse> {
  return apiFetch<UpdateLogResponse>(`/api/food-logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ logDate, ...data }),
  });
}
