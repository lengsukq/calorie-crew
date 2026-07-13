"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { MealType } from "@/lib/db/schema";
import { MEAL_ORDER, MEAL_LABELS, MEAL_ICONS } from "@/shared/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
  proteinG?: string;
  carbsG?: string;
  fatG?: string;
}

interface MealGroupProps {
  logs: Log[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  collapsible?: boolean;
  title?: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function MealGroup({
  logs,
  onDelete,
  onEdit,
  collapsible = true,
  title = "饮食记录",
  selectedIds,
  onToggleSelect,
}: MealGroupProps) {
  const [collapsedMeals, setCollapsedMeals] = useState<Set<string>>(new Set());

  const grouped = MEAL_ORDER.map((type) => ({
    type,
    label: MEAL_LABELS[type],
    Icon: MEAL_ICONS[type],
    items: logs.filter((l) => l.mealType === type),
  }));

  const hasAny = grouped.some((g) => g.items.length > 0);

  function toggleCollapse(type: string) {
    setCollapsedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  if (!hasAny) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">还没有记录，开始添加吧</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {grouped.map((group) => {
          const isCollapsed = collapsedMeals.has(group.type);
          const totalKcal = group.items.reduce((sum, item) => sum + item.calories, 0);

          return (
            <div key={group.type}>
              <button
                onClick={() => collapsible && toggleCollapse(group.type)}
                className={cn(
                  "flex w-full items-center gap-2 text-left",
                  collapsible ? "cursor-pointer" : "cursor-default",
                )}
                type="button"
              >
                <group.Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{group.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{totalKcal} kcal</span>
                {collapsible && (
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                      isCollapsed && "-rotate-90",
                    )}
                  />
                )}
              </button>

              {!isCollapsed && (
                <div className="mt-2 space-y-1.5">
                  {group.items.length === 0 ? (
                    <p className="px-6 text-xs text-muted-foreground">暂无记录</p>
                  ) : (
                    group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {selectedIds && onToggleSelect && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => onToggleSelect(item.id)}
                                className="h-4 w-4 rounded border-input accent-primary"
                              />
                            )}
                            <span className="truncate text-sm font-medium text-foreground">
                              {item.foodName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {item.servingDescription}
                            </span>
                          </div>
                          {(item.proteinG || item.carbsG || item.fatG) && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                              P {parseFloat(item.proteinG ?? "0").toFixed(1)} · C{" "}
                              {parseFloat(item.carbsG ?? "0").toFixed(1)} · F{" "}
                              {parseFloat(item.fatG ?? "0").toFixed(1)}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-bold text-primary tabular-nums">
                            {item.calories}
                            <span className="ml-0.5 text-xs font-normal text-muted-foreground">kcal</span>
                          </span>
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => onEdit(item.id)}
                              aria-label="编辑"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(item.id)}
                              aria-label="删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
