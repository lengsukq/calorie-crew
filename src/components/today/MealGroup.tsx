"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import type { MealType } from "@/lib/db/schema";
import { MEAL_ORDER, MEAL_LABELS, MEAL_ICONS } from "@/shared/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/progress/ProgressParts";
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
  /** 提供后，每个餐次标题行显示 "+" 按钮，空餐次以虚线占位呈现 */
  onAddMeal?: (mealType: MealType) => void;
}

export function MealGroup({
  logs,
  onDelete,
  onEdit,
  collapsible = true,
  title = "饮食记录",
  selectedIds,
  onToggleSelect,
  onAddMeal,
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

  if (!hasAny && !onAddMeal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={<UtensilsCrossed className="h-8 w-8" />} text="还没有记录，开始添加吧" />
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
                      onAddMeal && "ml-0",
                    )}
                  />
                )}
                {onAddMeal && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`添加${group.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddMeal(group.type);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.stopPropagation();
                        onAddMeal(group.type);
                      }
                    }}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                      !collapsible && "ml-auto",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                )}
              </button>

              {!isCollapsed && (
                <div className="mt-2 space-y-1.5">
                  {group.items.length === 0 ? (
                    onAddMeal ? (
                      <button
                        type="button"
                        onClick={() => onAddMeal(group.type)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        添加{group.label}
                      </button>
                    ) : (
                      <p className="px-6 text-xs text-muted-foreground">暂无记录</p>
                    )
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
                              className="h-9 w-9 text-muted-foreground hover:text-primary"
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
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
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
