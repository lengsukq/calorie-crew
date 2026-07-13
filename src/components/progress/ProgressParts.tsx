"use client";

interface StatBoxProps {
  label: string;
  value: string;
  unit: string;
}

export function StatBox({ label, value, unit }: StatBoxProps) {
  return (
    <div className="rounded-xl bg-white/50 px-3 py-4 text-center backdrop-blur-sm">
      <p className="text-xl font-bold text-slate-800">
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  text: string;
}

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <span className="text-3xl opacity-50">{icon}</span>
      <p className="text-sm text-slate-400">{text}</p>
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
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md"
          : "bg-white/50 text-slate-500 hover:bg-white/80"
      }`}
    >
      {label}
    </button>
  );
}
