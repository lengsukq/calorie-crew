"use client";

import { Plus } from "lucide-react";

interface QuickAddButtonProps {
  onClick: () => void;
  label?: string;
}

export function QuickAddButton({ onClick }: QuickAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-8 right-8 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 lg:flex"
      aria-label="添加饮食记录"
    >
      <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
    </button>
  );
}
