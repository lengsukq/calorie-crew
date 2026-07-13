"use client";

import { createDateRangeLogHook } from "@/hooks/createDateRangeLogHook";
import { deleteWeightLog, fetchWeightLogs, upsertWeightLog } from "@/lib/api/health-logs";
import type { WeightLogEntry, WeightLogFormData } from "@/shared/types";

export const useWeightLogs = createDateRangeLogHook<WeightLogEntry, WeightLogFormData>({
  loadErrorMessage: "加载体重记录失败",
  saveErrorMessage: "保存体重记录失败",
  removeErrorMessage: "删除体重记录失败",
  fetchLogs: fetchWeightLogs,
  saveLog: upsertWeightLog,
  removeLog: deleteWeightLog,
});
