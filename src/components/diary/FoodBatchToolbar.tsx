"use client";

import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FoodBatchToolbarProps {
  selectedCount: number;
  batchSaving: boolean;
  batchAction: "delete" | "copy" | null;
  batchTargetDate: string;
  onStartCopy: () => void;
  onCancelCopy: () => void;
  onConfirmCopy: () => void;
  onBatchDelete: () => void;
  onBatchTargetDateChange: (date: string) => void;
}

export function FoodBatchToolbar({
  selectedCount,
  batchSaving,
  batchAction,
  batchTargetDate,
  onStartCopy,
  onCancelCopy,
  onConfirmCopy,
  onBatchDelete,
  onBatchTargetDateChange,
}: FoodBatchToolbarProps) {
  const disabled = selectedCount === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">饮食记录</h2>
          <span className="text-xs text-muted-foreground">已选 {selectedCount} 项</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onStartCopy} disabled={disabled}>
            <Copy className="h-3.5 w-3.5" />
            复制到其他日期
          </Button>
          <Button variant="outline" size="sm" onClick={onBatchDelete} disabled={disabled || batchSaving} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            批量删除
          </Button>
        </div>
      </div>
      {batchAction === "copy" && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <Input
            type="date"
            value={batchTargetDate}
            onChange={(event) => onBatchTargetDateChange(event.target.value)}
            className="w-auto"
          />
          <Button size="sm" disabled={batchSaving} onClick={onConfirmCopy}>
            确认复制
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancelCopy}>
            取消
          </Button>
        </div>
      )}
    </div>
  );
}
