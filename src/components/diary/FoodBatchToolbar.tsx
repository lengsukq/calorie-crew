"use client";

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
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-slate-800">饮食记录</h2>
        <span className="text-xs text-slate-400">已选 {selectedCount} 项</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartCopy}
          disabled={disabled}
          className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          复制到其他日期
        </button>
        <button
          type="button"
          onClick={onBatchDelete}
          disabled={disabled || batchSaving}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          批量删除
        </button>
      </div>
      {batchAction === "copy" && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/60 p-3">
          <input
            type="date"
            value={batchTargetDate}
            onChange={(event) => onBatchTargetDateChange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
          />
          <button
            type="button"
            disabled={batchSaving}
            onClick={onConfirmCopy}
            className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认复制
          </button>
          <button
            type="button"
            onClick={onCancelCopy}
            className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-white"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
