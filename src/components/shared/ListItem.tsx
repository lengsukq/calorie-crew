import * as React from "react";
import { cn } from "@/lib/utils";

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 统一列表行容器：左侧内容 + 右侧操作。
 * 替换原 .list-item 自定义类，去掉 hover 横移。
 */
export function ListItem({ children, className }: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ListItemContentProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

function ListItemContent({ title, subtitle, className }: ListItemContentProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <p className="truncate text-sm font-medium text-foreground">{title}</p>
      {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

interface ListItemActionsProps {
  children: React.ReactNode;
  className?: string;
}

function ListItemActions({ children, className }: ListItemActionsProps) {
  return <div className={cn("flex shrink-0 items-center gap-1", className)}>{children}</div>;
}

ListItem.Content = ListItemContent;
ListItem.Actions = ListItemActions;
