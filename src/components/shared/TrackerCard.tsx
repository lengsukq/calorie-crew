"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TrackerCardProps {
  icon: LucideIcon;
  title: string;
  /** 摘要模式下展示的关键数值，如 "62.5 kg" / "1500 ml" */
  value?: string;
  /** 数值下方的辅助说明，如 "目标 60 kg" */
  hint?: string;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  children: ReactNode;
}

/**
 * 紧凑式健康追踪卡片：摘要为单行（图标 + 标题 + 关键数值 + 展开箭头），
 * 点击展开完整表单/列表。用于今日页左栏，减少垂直占用。
 */
export function TrackerCard({
  icon: Icon,
  title,
  value,
  hint,
  defaultExpanded = false,
  children,
}: TrackerCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
        aria-expanded={expanded}
      >
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {value && (
          <span className="shrink-0 text-sm font-bold text-foreground tabular-nums">{value}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t pt-3">{children}</CardContent>
        </div>
      </div>
    </Card>
  );
}
