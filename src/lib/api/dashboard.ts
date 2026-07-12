import { apiFetch } from "@/lib/api/client";
import type { FoodLogEntry, DailySummary, HistoryDay } from "@/shared/types";

interface TodayResponse {
  logs: FoodLogEntry[];
  summary: DailySummary | null;
}

interface HistoryResponse {
  summaries: HistoryDay[];
  days: number;
}

export function fetchTodayData(date: string): Promise<TodayResponse> {
  return apiFetch<TodayResponse>(`/api/dashboard/today?date=${encodeURIComponent(date)}`);
}

export function fetchHistory(days: number): Promise<HistoryResponse> {
  return apiFetch<HistoryResponse>(`/api/dashboard/history?days=${days}`);
}
