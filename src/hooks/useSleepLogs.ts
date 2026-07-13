"use client";

import { createDateRangeLogHook } from "@/hooks/createDateRangeLogHook";
import { deleteSleepLog, fetchSleepLogs, upsertSleepLog } from "@/lib/api/health-logs";
import type { SleepLogEntry, SleepLogFormData } from "@/shared/types";

export const useSleepLogs = createDateRangeLogHook<SleepLogEntry, SleepLogFormData>({
  loadErrorMessage: "加载睡眠记录失败",
  saveErrorMessage: "保存睡眠记录失败",
  removeErrorMessage: "删除睡眠记录失败",
  fetchLogs: fetchSleepLogs,
  saveLog: upsertSleepLog,
  removeLog: deleteSleepLog,
});
