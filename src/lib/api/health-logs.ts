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

interface WaterLogEntry {
  id: string;
  logDate: string;
  amountMl: number;
  note: string | null;
  createdAt: string;
}

interface WaterLogResponse {
  log: WaterLogEntry;
}

interface WaterLogsResponse {
  logs: WaterLogEntry[];
}

interface SleepLogEntry {
  id: string;
  logDate: string;
  sleepMinutes: number;
  quality: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SleepLogResponse {
  log: SleepLogEntry;
}

interface SleepLogsResponse {
  logs: SleepLogEntry[];
}

interface BodyMeasurementEntry {
  id: string;
  logDate: string;
  chestCm: string | null;
  waistCm: string | null;
  hipCm: string | null;
  armCm: string | null;
  legCm: string | null;
  note: string | null;
  createdAt: string;
}

interface BodyMeasurementResponse {
  log: BodyMeasurementEntry;
}

interface BodyMeasurementsResponse {
  logs: BodyMeasurementEntry[];
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

export function fetchWaterLogs(startDate: string, endDate: string): Promise<WaterLogsResponse> {
  return apiFetch<WaterLogsResponse>(`/api/water-logs?${buildRangeQuery(startDate, endDate)}`);
}

export function createWaterLog(logDate: string, amountMl: number, note?: string | null): Promise<WaterLogResponse> {
  return apiFetch<WaterLogResponse>("/api/water-logs", {
    method: "POST",
    body: JSON.stringify({ logDate, amountMl, note }),
  });
}

export function deleteWaterLog(id: string): Promise<void> {
  return apiFetch<void>(`/api/water-logs/${id}`, { method: "DELETE" });
}

export function fetchSleepLogs(startDate: string, endDate: string): Promise<SleepLogsResponse> {
  return apiFetch<SleepLogsResponse>(`/api/sleep-logs?${buildRangeQuery(startDate, endDate)}`);
}

export function upsertSleepLog(logDate: string, sleepMinutes: number, quality: number, note?: string | null): Promise<SleepLogResponse> {
  return apiFetch<SleepLogResponse>("/api/sleep-logs", {
    method: "POST",
    body: JSON.stringify({ logDate, sleepMinutes, quality, note }),
  });
}

export function deleteSleepLog(id: string): Promise<void> {
  return apiFetch<void>(`/api/sleep-logs/${id}`, { method: "DELETE" });
}

export function fetchBodyMeasurements(startDate: string, endDate: string): Promise<BodyMeasurementsResponse> {
  return apiFetch<BodyMeasurementsResponse>(`/api/body-measurements?${buildRangeQuery(startDate, endDate)}`);
}

export function upsertBodyMeasurement(
  logDate: string,
  data: {
    chestCm?: number | null;
    waistCm?: number | null;
    hipCm?: number | null;
    armCm?: number | null;
    legCm?: number | null;
    note?: string | null;
  },
): Promise<BodyMeasurementResponse> {
  return apiFetch<BodyMeasurementResponse>("/api/body-measurements", {
    method: "POST",
    body: JSON.stringify({ logDate, ...data }),
  });
}

export function deleteBodyMeasurement(id: string): Promise<void> {
  return apiFetch<void>(`/api/body-measurements/${id}`, { method: "DELETE" });
}

export function updateWeightTarget(weightTargetKg: number | null): Promise<UpdateTargetResponse> {
  return apiFetch<UpdateTargetResponse>("/api/users/target", {
    method: "PUT",
    body: JSON.stringify({ weightTargetKg }),
  });
}
