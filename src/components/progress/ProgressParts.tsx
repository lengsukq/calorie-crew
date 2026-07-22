"use client";

import type { ReactNode } from "react";

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
  hint?: string;
}

export function EmptyState({ icon, text, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      {icon && <div className="rounded-full bg-muted p-3 text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
