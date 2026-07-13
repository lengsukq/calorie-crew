import { apiFetch } from "@/lib/api/client";
import type {
  ExerciseLogEntry,
  ExerciseLogFormData,
  WeightLogEntry,
  WeightLogFormData,
} from "@/shared/types";

interface WeightLogsResponse {
  logs: WeightLogEntry[];
}

interface WeightLogResponse {
  log: WeightLogEntry;
}

interface ExerciseLogsResponse {
  logs: ExerciseLogEntry[];
}

interface ExerciseLogResponse {
  log: ExerciseLogEntry;
}

interface UpdateTargetResponse {
  success: boolean;
}

function buildRangeQuery(startDate: string, endDate: string): string {
  const queryParams = new URLSearchParams({ startDate, endDate });
  return queryParams.toString();
}

export function fetchWeightLogs(startDate: string, endDate: string): Promise<WeightLogsResponse> {
  return apiFetch<WeightLogsResponse>(`/api/weight-logs?${buildRangeQuery(startDate, endDate)}`);
}

export function upsertWeightLog(data: WeightLogFormData): Promise<WeightLogResponse> {
  return apiFetch<WeightLogResponse>("/api/weight-logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteWeightLog(id: string): Promise<void> {
  return apiFetch<void>(`/api/weight-logs/${id}`, { method: "DELETE" });
}

export function fetchExerciseLogs(startDate: string, endDate: string): Promise<ExerciseLogsResponse> {
  return apiFetch<ExerciseLogsResponse>(`/api/exercise-logs?${buildRangeQuery(startDate, endDate)}`);
}

export function createExerciseLog(data: ExerciseLogFormData): Promise<ExerciseLogResponse> {
  return apiFetch<ExerciseLogResponse>("/api/exercise-logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteExerciseLog(id: string): Promise<void> {
  return apiFetch<void>(`/api/exercise-logs/${id}`, { method: "DELETE" });
}

export function updateWeightTarget(weightTargetKg: number | null): Promise<UpdateTargetResponse> {
  return apiFetch<UpdateTargetResponse>("/api/users/target", {
    method: "PUT",
    body: JSON.stringify({ weightTargetKg }),
  });
}
