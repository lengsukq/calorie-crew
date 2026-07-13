"use client";

import { createDateRangeLogHook } from "@/hooks/createDateRangeLogHook";
import {
  deleteBodyMeasurement,
  fetchBodyMeasurements,
  upsertBodyMeasurement,
} from "@/lib/api/health-logs";
import type { BodyMeasurementEntry, BodyMeasurementFormData } from "@/shared/types";

export const useBodyMeasurements = createDateRangeLogHook<BodyMeasurementEntry, BodyMeasurementFormData>({
  loadErrorMessage: "加载围度记录失败",
  saveErrorMessage: "保存围度记录失败",
  removeErrorMessage: "删除围度记录失败",
  fetchLogs: fetchBodyMeasurements,
  saveLog: upsertBodyMeasurement,
  removeLog: deleteBodyMeasurement,
});
