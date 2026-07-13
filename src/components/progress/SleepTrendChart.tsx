"use client";

import type { SleepLogEntry } from "@/shared/types";

interface SleepTrendChartProps {
  logs: SleepLogEntry[];
}

const SIX_HOURS_MINUTES = 360;
const EIGHT_HOURS_MINUTES = 480;

export function SleepTrendChart({ logs }: SleepTrendChartProps) {
  const sortedLogs = [...logs].sort((left, right) => left.logDate.localeCompare(right.logDate));
  if (sortedLogs.length === 0) return null;

  const chartHeight = 180;
  const chartWidth = Math.max(320, sortedLogs.length * 52);
  const leftPadding = 36;
  const bottomPadding = 28;
  const plotWidth = chartWidth - leftPadding - 16;
  const plotHeight = chartHeight - bottomPadding - 12;
  const allMinutes = [...sortedLogs.map((log) => log.sleepMinutes), EIGHT_HOURS_MINUTES, SIX_HOURS_MINUTES];
  const maxMinutes = Math.max(...allMinutes);
  const minMinutes = Math.min(...allMinutes, 0);
  const rangePadding = Math.max((maxMinutes - minMinutes) * 0.15, 30);
  const chartMinimum = Math.max(0, minMinutes - rangePadding);
  const chartMaximum = maxMinutes + rangePadding;

  function getXPosition(index: number): number {
    if (sortedLogs.length === 1) return leftPadding + plotWidth / 2;
    return leftPadding + (index / (sortedLogs.length - 1)) * plotWidth;
  }

  function getYPosition(minutes: number): number {
    const ratio = (minutes - chartMinimum) / (chartMaximum - chartMinimum);
    return 12 + (1 - ratio) * plotHeight;
  }

  function formatHours(minutes: number): string {
    return (minutes / 60).toFixed(1);
  }

  const polylinePoints = sortedLogs
    .map((log, index) => `${getXPosition(index)},${getYPosition(log.sleepMinutes)}`)
    .join(" ");
  const sixHourY = getYPosition(SIX_HOURS_MINUTES);
  const eightHourY = getYPosition(EIGHT_HOURS_MINUTES);

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
        <text x="0" y="18" fontSize="10" fill="#94a3b8">
          {formatHours(chartMaximum)}h
        </text>
        <text x="0" y={plotHeight + 16} fontSize="10" fill="#94a3b8">
          {formatHours(chartMinimum)}h
        </text>
        <line x1={leftPadding} y1="12" x2={leftPadding} y2={plotHeight + 12} stroke="#e2e8f0" />
        <line x1={leftPadding} y1={plotHeight + 12} x2={chartWidth - 16} y2={plotHeight + 12} stroke="#e2e8f0" />
        <line
          x1={leftPadding}
          y1={eightHourY}
          x2={chartWidth - 16}
          y2={eightHourY}
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="4,3"
        />
        <text x={chartWidth - 58} y={eightHourY - 4} fontSize="10" fill="#10b981">
          8h
        </text>
        <line
          x1={leftPadding}
          y1={sixHourY}
          x2={chartWidth - 16}
          y2={sixHourY}
          stroke="#f59e0b"
          strokeWidth="1"
          strokeDasharray="4,3"
        />
        <text x={chartWidth - 58} y={sixHourY - 4} fontSize="10" fill="#f59e0b">
          6h
        </text>
        <polyline points={polylinePoints} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        {sortedLogs.map((log, index) => {
          const xPosition = getXPosition(index);
          const yPosition = getYPosition(log.sleepMinutes);
          return (
            <g key={log.id}>
              <circle cx={xPosition} cy={yPosition} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
              <text x={xPosition} y={yPosition - 10} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="600">
                {formatHours(log.sleepMinutes)}
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
