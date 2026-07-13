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
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
      aria-label="添加饮食记录"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
