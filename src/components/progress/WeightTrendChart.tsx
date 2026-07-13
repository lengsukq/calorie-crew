"use client";

import type { WeightLogEntry } from "@/shared/types";

interface WeightTrendChartProps {
  logs: WeightLogEntry[];
  weightTargetKg: string | null;
}

export function WeightTrendChart({ logs, weightTargetKg }: WeightTrendChartProps) {
  const sortedLogs = [...logs].sort((firstLog, secondLog) => firstLog.logDate.localeCompare(secondLog.logDate));
  if (sortedLogs.length === 0) return null;

  const chartHeight = 180;
  const chartWidth = Math.max(320, sortedLogs.length * 52);
  const leftPadding = 36;
  const bottomPadding = 28;
  const plotWidth = chartWidth - leftPadding - 16;
  const plotHeight = chartHeight - bottomPadding - 12;
  const weights = sortedLogs.map((log) => Number(log.weightKg));
  const targetWeight = weightTargetKg ? Number(weightTargetKg) : null;
  const minWeight = Math.min(...weights, targetWeight ?? Number.POSITIVE_INFINITY);
  const maxWeight = Math.max(...weights, targetWeight ?? Number.NEGATIVE_INFINITY);
  const rangePadding = Math.max((maxWeight - minWeight) * 0.2, 1);
  const chartMinimumWeight = minWeight - rangePadding;
  const chartMaximumWeight = maxWeight + rangePadding;

  function getXPosition(index: number): number {
    if (sortedLogs.length === 1) return leftPadding + plotWidth / 2;
    return leftPadding + (index / (sortedLogs.length - 1)) * plotWidth;
  }

  function getYPosition(weight: number): number {
    const weightRatio = (weight - chartMinimumWeight) / (chartMaximumWeight - chartMinimumWeight);
    return 12 + (1 - weightRatio) * plotHeight;
  }

  const polylinePoints = sortedLogs
    .map((log, index) => `${getXPosition(index)},${getYPosition(Number(log.weightKg))}`)
    .join(" ");
  const targetLineY = targetWeight === null ? null : getYPosition(targetWeight);

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
        <text x="0" y="18" fontSize="10" fill="#94a3b8">
          {chartMaximumWeight.toFixed(1)}kg
        </text>
        <text x="0" y={plotHeight + 16} fontSize="10" fill="#94a3b8">
          {chartMinimumWeight.toFixed(1)}kg
        </text>
        <line x1={leftPadding} y1="12" x2={leftPadding} y2={plotHeight + 12} stroke="#e2e8f0" />
        <line x1={leftPadding} y1={plotHeight + 12} x2={chartWidth - 16} y2={plotHeight + 12} stroke="#e2e8f0" />
        {targetLineY !== null && (
          <>
            <line
              x1={leftPadding}
              y1={targetLineY}
              x2={chartWidth - 16}
              y2={targetLineY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <text x={chartWidth - 58} y={targetLineY - 4} fontSize="10" fill="#f59e0b">
              目标
            </text>
          </>
        )}
        <polyline points={polylinePoints} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
        {sortedLogs.map((log, index) => {
          const xPosition = getXPosition(index);
          const yPosition = getYPosition(Number(log.weightKg));

          return (
            <g key={log.id}>
              <circle cx={xPosition} cy={yPosition} r="4" fill="#06b6d4" stroke="white" strokeWidth="2" />
              <text x={xPosition} y={yPosition - 10} textAnchor="middle" fontSize="10" fill="#0891b2" fontWeight="600">
                {Number(log.weightKg).toFixed(1)}
              </text>
              <text x={xPosition} y={chartHeight - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {log.logDate.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
