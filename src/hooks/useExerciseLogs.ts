"use client";

import { createDateRangeLogHook } from "@/hooks/createDateRangeLogHook";
import { createExerciseLog, deleteExerciseLog, fetchExerciseLogs } from "@/lib/api/health-logs";
import type { ExerciseLogEntry, ExerciseLogFormData } from "@/shared/types";

const useExerciseLogsBase = createDateRangeLogHook<ExerciseLogEntry, ExerciseLogFormData>({
  loadErrorMessage: "加载运动记录失败",
  saveErrorMessage: "保存运动记录失败",
  removeErrorMessage: "删除运动记录失败",
  fetchLogs: fetchExerciseLogs,
  saveLog: createExerciseLog,
  removeLog: deleteExerciseLog,
});

export function useExerciseLogs(options: Parameters<typeof useExerciseLogsBase>[0]) {
  const result = useExerciseLogsBase(options);
  return {
    ...result,
    addLog: result.saveLog,
  };
}
