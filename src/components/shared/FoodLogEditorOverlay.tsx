"use client";

import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";
import { foodLogEntryToFormData } from "@/lib/mappers/food-log";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FoodLogForm } from "@/components/shared/FoodLogForm";
import { FoodLogManualForm } from "@/components/shared/FoodLogManualForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface FoodLogEditorOverlayProps {
  isOpenForAdd: boolean;
  editingLog: FoodLogEntry | null;
  onAddSubmit: (items: FoodLogFormData[]) => Promise<void>;
  onEditSubmit: (data: FoodLogFormData) => Promise<void>;
  onCloseAdd: () => void;
  onCloseEdit: () => void;
  defaultMealType?: string;
}

export function FoodLogEditorOverlay({
  isOpenForAdd,
  editingLog,
  onAddSubmit,
  onEditSubmit,
  onCloseAdd,
  onCloseEdit,
  defaultMealType,
}: FoodLogEditorOverlayProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEditing = Boolean(editingLog);
  const side = isDesktop ? "right" : "bottom";

  return (
    <>
      <Sheet open={isOpenForAdd} onOpenChange={(open) => { if (!open) onCloseAdd(); }}>
        <SheetContent side={side} className={isDesktop ? "" : "max-h-[85dvh] overflow-y-auto"}>
          <SheetHeader>
            <SheetTitle>添加饮食记录</SheetTitle>
            <SheetDescription className="sr-only">通过搜索或 AI 识别添加食物</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex-1 overflow-y-auto">
            <FoodLogForm key={defaultMealType ?? "add"} onSubmit={onAddSubmit} onCancel={onCloseAdd} defaultMealType={defaultMealType} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditing} onOpenChange={(open) => { if (!open) onCloseEdit(); }}>
        <SheetContent side={side} className={isDesktop ? "" : "max-h-[85dvh] overflow-y-auto"}>
          <SheetHeader>
            <SheetTitle>编辑饮食记录</SheetTitle>
            <SheetDescription className="sr-only">修改已选食物的份量或营养信息</SheetDescription>
          </SheetHeader>
          {editingLog && (
            <div className="mt-4 flex-1 overflow-y-auto">
              <FoodLogManualForm
                key={editingLog.id}
                initialValue={foodLogEntryToFormData(editingLog)}
                onSubmit={onEditSubmit}
                onCancel={onCloseEdit}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
