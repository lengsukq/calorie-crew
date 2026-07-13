"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  keywords: string[];
}

interface UseFoodSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: FoodItem[];
  loading: boolean;
  clear: () => void;
}

export function useFoodSearch(): UseFoodSearchReturn {
  const [query, setQuery] = useState("");
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayQuery, setDisplayQuery] = useState("");

  // Load food database on mount
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/data/foods.json");
        const data = (await response.json()) as FoodItem[];
        setAllFoods(data);
      } catch {
        // fallback empty
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Debounce the query (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDisplayQuery(query.trim().toLowerCase());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const results = useMemo(() => {
    if (!displayQuery) return [];
    return allFoods
      .filter((food) => {
        const nameMatch = food.name.toLowerCase().includes(displayQuery);
        const keywordMatch = food.keywords.some((k) =>
          k.toLowerCase().includes(displayQuery),
        );
        const categoryMatch = food.category.toLowerCase().includes(displayQuery);
        return nameMatch || keywordMatch || categoryMatch;
      })
      .slice(0, 10)
      .sort((a, b) => {
        // Prioritize: exact name match > prefix match > contains match
        const aExact = a.name.toLowerCase() === displayQuery ? 0 : 1;
        const bExact = b.name.toLowerCase() === displayQuery ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        const aPrefix = a.name.toLowerCase().startsWith(displayQuery) ? 0 : 1;
        const bPrefix = b.name.toLowerCase().startsWith(displayQuery) ? 0 : 1;
        return aPrefix - bPrefix;
      });
  }, [displayQuery, allFoods]);

  function clear() {
    setQuery("");
    setDisplayQuery("");
  }

  return { query, setQuery, results, loading, clear };
}
