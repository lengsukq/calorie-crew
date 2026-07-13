"use client";

import { useFoodSearch, type FoodItem } from "@/hooks/useFoodSearch";

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const { query, setQuery, results, loading } = useFoodSearch();

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="glass-input"
        placeholder="搜索食物名称，如：米饭、苹果、牛肉..."
      />
      {query.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 shadow-lg backdrop-blur-xl">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="y2k-spinner h-4 w-4" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">
              未找到匹配的食物
            </div>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  onSelect(food);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-cyan-50/50"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-700">{food.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{food.category}</span>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <div>{food.calories} kcal</div>
                  <div className="text-[10px]">{food.servingSize}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
