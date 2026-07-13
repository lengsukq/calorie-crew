"use client";

import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";
import { foodLogEntryToFormData } from "@/lib/mappers/food-log";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { SlideOver } from "@/components/ui/SlideOver";
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
}

export function FoodLogEditorOverlay({
  isOpenForAdd,
  editingLog,
  onAddSubmit,
  onEditSubmit,
  onCloseAdd,
  onCloseEdit,
}: FoodLogEditorOverlayProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEditing = Boolean(editingLog);

  if (isDesktop) {
    return (
      <>
        <SlideOver isOpen={isOpenForAdd} onClose={onCloseAdd} title="添加饮食记录">
          <FoodLogForm onSubmit={onAddSubmit} onCancel={onCloseAdd} />
        </SlideOver>
        <SlideOver isOpen={isEditing} onClose={onCloseEdit} title="编辑饮食记录">
          {editingLog && (
            <FoodLogManualForm
              key={editingLog.id}
              initialValue={foodLogEntryToFormData(editingLog)}
              onSubmit={onEditSubmit}
              onCancel={onCloseEdit}
            />
          )}
        </SlideOver>
      </>
    );
  }

  return (
    <>
      <BottomSheet isOpen={isOpenForAdd} onClose={onCloseAdd} title="添加饮食记录">
        <FoodLogForm onSubmit={onAddSubmit} onCancel={onCloseAdd} />
      </BottomSheet>
      <BottomSheet isOpen={isEditing} onClose={onCloseEdit} title="编辑饮食记录">
        {editingLog && (
          <FoodLogManualForm
            key={editingLog.id}
            initialValue={foodLogEntryToFormData(editingLog)}
            onSubmit={onEditSubmit}
            onCancel={onCloseEdit}
          />
        )}
      </BottomSheet>
    </>
  );
}
