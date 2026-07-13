"use client";

import { useState } from "react";
import type { BodyMeasurementEntry } from "@/shared/types";

interface BodyMeasurementTrendChartProps {
  logs: BodyMeasurementEntry[];
}

type MeasurementPart = "chestCm" | "waistCm" | "hipCm" | "armCm" | "legCm";

const PART_OPTIONS: Array<{ value: MeasurementPart; label: string }> = [
  { value: "waistCm", label: "腰围" },
  { value: "chestCm", label: "胸围" },
  { value: "hipCm", label: "臀围" },
  { value: "armCm", label: "臂围" },
  { value: "legCm", label: "腿围" },
];

const PART_COLORS: Record<MeasurementPart, string> = {
  chestCm: "#06b6d4",
  waistCm: "#8b5cf6",
  hipCm: "#10b981",
  armCm: "#f59e0b",
  legCm: "#ec4899",
};

export function BodyMeasurementTrendChart({ logs }: BodyMeasurementTrendChartProps) {
  const [selectedPart, setSelectedPart] = useState<MeasurementPart>("waistCm");

  const sortedLogs = [...logs]
    .filter((log) => log[selectedPart] !== null)
    .sort((left, right) => left.logDate.localeCompare(right.logDate));

  if (sortedLogs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex flex-wrap justify-center gap-2">
          {PART_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedPart(option.value)}
              disabled
              className="rounded-lg bg-white/70 px-3 py-1 text-xs font-semibold text-slate-400"
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">暂无该部位的围度记录</p>
      </div>
    );
  }

  const chartHeight = 180;
  const chartWidth = Math.max(320, sortedLogs.length * 52);
  const leftPadding = 36;
  const bottomPadding = 28;
  const plotWidth = chartWidth - leftPadding - 16;
  const plotHeight = chartHeight - bottomPadding - 12;
  const values = sortedLogs.map((log) => Number(log[selectedPart]));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const rangePadding = Math.max((maxValue - minValue) * 0.2, 1);
  const chartMinimum = minValue - rangePadding;
  const chartMaximum = maxValue + rangePadding;
  const strokeColor = PART_COLORS[selectedPart];

  function getXPosition(index: number): number {
    if (sortedLogs.length === 1) return leftPadding + plotWidth / 2;
    return leftPadding + (index / (sortedLogs.length - 1)) * plotWidth;
  }

  function getYPosition(value: number): number {
    const ratio = (value - chartMinimum) / (chartMaximum - chartMinimum);
    return 12 + (1 - ratio) * plotHeight;
  }

  const polylinePoints = sortedLogs
    .map((log, index) => `${getXPosition(index)},${getYPosition(Number(log[selectedPart]))}`)
    .join(" ");

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-2">
        {PART_OPTIONS.map((option) => {
          const hasData = logs.some((log) => log[option.value] !== null);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedPart(option.value)}
              disabled={!hasData}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                selectedPart === option.value
                  ? "bg-cyan-100 text-cyan-700"
                  : hasData
                    ? "bg-white/70 text-slate-500 hover:bg-white"
                    : "cursor-not-allowed bg-white/40 text-slate-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
        <text x="0" y="18" fontSize="10" fill="#94a3b8">
          {chartMaximum.toFixed(1)}cm
        </text>
        <text x="0" y={plotHeight + 16} fontSize="10" fill="#94a3b8">
          {chartMinimum.toFixed(1)}cm
        </text>
        <line x1={leftPadding} y1="12" x2={leftPadding} y2={plotHeight + 12} stroke="#e2e8f0" />
        <line x1={leftPadding} y1={plotHeight + 12} x2={chartWidth - 16} y2={plotHeight + 12} stroke="#e2e8f0" />
        <polyline points={polylinePoints} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        {sortedLogs.map((log, index) => {
          const xPosition = getXPosition(index);
          const yPosition = getYPosition(Number(log[selectedPart]));
          return (
            <g key={log.id}>
              <circle cx={xPosition} cy={yPosition} r="4" fill={strokeColor} stroke="white" strokeWidth="2" />
              <text x={xPosition} y={yPosition - 10} textAnchor="middle" fontSize="10" fill={strokeColor} fontWeight="600">
                {Number(log[selectedPart]).toFixed(1)}
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
