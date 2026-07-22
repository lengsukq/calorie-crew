"use client";

import type { WaterLogEntry } from "@/shared/types";

interface WaterTrendChartProps {
  logs: WaterLogEntry[];
  targetMl?: number;
}

interface DailyWater {
  logDate: string;
  amountMl: number;
}

function aggregateByDate(logs: WaterLogEntry[]): DailyWater[] {
  const grouped = new Map<string, number>();
  for (const log of logs) {
    const current = grouped.get(log.logDate) ?? 0;
    grouped.set(log.logDate, current + log.amountMl);
  }
  return Array.from(grouped.entries())
    .map(([logDate, amountMl]) => ({ logDate, amountMl }))
    .sort((left, right) => left.logDate.localeCompare(right.logDate));
}

export function WaterTrendChart({ logs, targetMl = 2000 }: WaterTrendChartProps) {
  const dailyData = aggregateByDate(logs);
  if (dailyData.length === 0) return null;

  const chartHeight = 180;
  const chartWidth = Math.max(320, dailyData.length * 52);
  const leftPadding = 36;
  const bottomPadding = 28;
  const plotWidth = chartWidth - leftPadding - 16;
  const plotHeight = chartHeight - bottomPadding - 12;
  const maxValue = Math.max(...dailyData.map((item) => item.amountMl), targetMl);
  const chartMaximum = maxValue * 1.15;

  function getXPosition(index: number): number {
    const slotWidth = plotWidth / dailyData.length;
    return leftPadding + slotWidth * index + slotWidth / 2;
  }

  function getBarHeight(amountMl: number): number {
    return (amountMl / chartMaximum) * plotHeight;
  }

  function getBarY(amountMl: number): number {
    return 12 + plotHeight - getBarHeight(amountMl);
  }

  const targetLineY = 12 + plotHeight - (targetMl / chartMaximum) * plotHeight;
  const barWidth = Math.max(8, (plotWidth / dailyData.length) * 0.6);

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
        <text x="0" y="18" fontSize="10" fill="hsl(var(--chart-label))">
          {Math.round(chartMaximum)}ml
        </text>
        <text x="0" y={plotHeight + 16} fontSize="10" fill="hsl(var(--chart-label))">
          0ml
        </text>
        <line x1={leftPadding} y1="12" x2={leftPadding} y2={plotHeight + 12} stroke="hsl(var(--chart-grid))" />
        <line x1={leftPadding} y1={plotHeight + 12} x2={chartWidth - 16} y2={plotHeight + 12} stroke="hsl(var(--chart-grid))" />
        <line
          x1={leftPadding}
          y1={targetLineY}
          x2={chartWidth - 16}
          y2={targetLineY}
          stroke="hsl(var(--chart-3))"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <text x={chartWidth - 58} y={targetLineY - 4} fontSize="10" fill="hsl(var(--chart-3))">
          目标
        </text>
        {dailyData.map((item, index) => {
          const xPosition = getXPosition(index);
          const barY = getBarY(item.amountMl);
          const barHeight = getBarHeight(item.amountMl);
          return (
            <g key={item.logDate}>
              <rect
                x={xPosition - barWidth / 2}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill="url(#water-gradient)"
              />
              <text x={xPosition} y={barY - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--chart-1))" fontWeight="600">
                {item.amountMl}
              </text>
              <text x={xPosition} y={chartHeight - 8} textAnchor="middle" fontSize="9" fill="hsl(var(--chart-label))">
                {item.logDate.slice(5)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
