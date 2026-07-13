import { toast } from "sonner";

interface UndoableDeleteOptions {
  successMessage: string;
  undoLabel?: string;
  duration?: number;
}

/**
 * 执行一次删除操作，并展示带「撤销」按钮的 toast。
 * 调用方负责先乐观移除列表项；当用户点击撤销时，调用 onUndo 恢复。
 * onConfirm 在 API 调用成功后执行（通常静默 reload），
 * 失败时调用方应自行回滚并 toast.error。
 */
export async function deleteWithUndo(
  onConfirm: () => Promise<void>,
  onUndo: () => void | Promise<void>,
  options: UndoableDeleteOptions,
): Promise<void> {
  toast(options.successMessage, {
    duration: options.duration ?? 5000,
    action: {
      label: options.undoLabel ?? "撤销",
      onClick: () => {
        void onUndo();
      },
    },
  });
  try {
    await onConfirm();
  } catch {
    // 由调用方在 catch 中处理回滚与错误提示
    throw new Error("delete failed");
  }
}
