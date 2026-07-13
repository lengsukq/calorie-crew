"use client";

import { Search } from "lucide-react";
import { useFoodSearch, type FoodItem } from "@/hooks/useFoodSearch";
import { Loader2 } from "lucide-react";

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const { query, setQuery, results, loading } = useFoodSearch();

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="搜索食物，如：米饭、苹果、牛肉"
        />
      </div>
      {query.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              搜索中...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">未找到匹配的食物</div>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  onSelect(food);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{food.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{food.category}</span>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <div className="tabular-nums">{food.calories} kcal</div>
                  <div className="text-[11px]">{food.servingSize}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
