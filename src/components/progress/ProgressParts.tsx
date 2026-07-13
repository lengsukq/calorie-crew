"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatBoxProps {
  label: string;
  value: string;
  unit: string;
}

export function StatBox({ label, value, unit }: StatBoxProps) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="text-xl font-bold text-foreground tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  text: string;
}

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

interface PeriodButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

export function PeriodButton({ active, onClick, label }: PeriodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      )}
    >
      {label}
    </button>
  );
}
