"use client";

import type { ReactNode } from "react";

interface MiniStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  gradient?: string;
  progress?: {
    current: number;
    max: number;
  };
}

/**
 * 通用迷你统计卡片 -- 统一 Today/Diary/Progress 页中的小指标卡.
 * 支持纯数值展示和带进度条两种模式.
 */
export function MiniStatCard({
  label,
  value,
  unit,
  icon,
  gradient = "from-cyan-400 to-blue-500",
  progress,
}: MiniStatCardProps) {
  const progressPercent = progress
    ? Math.min((progress.current / progress.max) * 100, 100)
    : 0;

  return (
    <div className="rounded-xl bg-white/50 px-3 py-3 text-center backdrop-blur-sm transition-all duration-200 hover:bg-white/70 hover:shadow-sm">
      {icon && (
        <div
          className={`icon-box !mb-2 !h-9 !w-9 !rounded-lg bg-gradient-to-br ${gradient} mx-auto`}
        >
          {icon}
        </div>
      )}
      <p className="text-lg font-bold text-slate-700">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-slate-400">
            {unit}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-400">{label}</p>
      {progress && (
        <div className="mt-2">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-[9px] text-slate-400">
            {progress.current} / {progress.max}
          </p>
        </div>
      )}
    </div>
  );
}
