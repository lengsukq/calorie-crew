"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteBodyMeasurement, fetchBodyMeasurements, upsertBodyMeasurement } from "@/lib/api/health-logs";
import type { BodyMeasurementEntry, BodyMeasurementFormData } from "@/shared/types";

interface UseBodyMeasurementsOptions {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

interface UseBodyMeasurementsReturn {
  logs: BodyMeasurementEntry[];
  loading: boolean;
  error: string | null;
  saveLog: (data: BodyMeasurementFormData) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useBodyMeasurements({
  startDate,
  endDate,
  enabled = true,
}: UseBodyMeasurementsOptions): UseBodyMeasurementsReturn {
  const [logs, setLogs] = useState<BodyMeasurementEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBodyMeasurements(startDate, endDate);
      setLogs(result.logs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载围度记录失败";
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (enabled) {
      void load();
    }
  }, [enabled, load]);

  const saveLog = useCallback(
    async (data: BodyMeasurementFormData) => {
      await upsertBodyMeasurement(data.logDate, {
        chestCm: data.chestCm ?? null,
        waistCm: data.waistCm ?? null,
        hipCm: data.hipCm ?? null,
        armCm: data.armCm ?? null,
        legCm: data.legCm ?? null,
        note: data.note,
      });
      await load();
    },
    [load],
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteBodyMeasurement(id);
      await load();
    },
    [load],
  );

  return { logs, loading, error, saveLog, removeLog, reload: load };
}