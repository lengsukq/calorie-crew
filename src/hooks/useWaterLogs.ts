"use client";

import { createDateRangeLogHook } from "@/hooks/createDateRangeLogHook";
import { createWaterLog, deleteWaterLog, fetchWaterLogs } from "@/lib/api/health-logs";
import type { WaterLogEntry, WaterLogFormData } from "@/shared/types";

const useWaterLogsBase = createDateRangeLogHook<WaterLogEntry, WaterLogFormData>({
  loadErrorMessage: "加载饮水记录失败",
  saveErrorMessage: "保存饮水记录失败",
  removeErrorMessage: "删除饮水记录失败",
  fetchLogs: fetchWaterLogs,
  saveLog: createWaterLog,
  removeLog: deleteWaterLog,
});

export function useWaterLogs(options: Parameters<typeof useWaterLogsBase>[0]) {
  const result = useWaterLogsBase(options);
  return {
    ...result,
    addLog: result.saveLog,
  };
}
