"use client";
// 工具型 Hook，不遵循统一数据请求签名

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

export function useFoodSearch(personalFoods: FoodItem[] = []): UseFoodSearchReturn {
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

    const matches = (food: FoodItem) => {
      const nameMatch = food.name.toLowerCase().includes(displayQuery);
      const keywordMatch = food.keywords.some((k) => k.toLowerCase().includes(displayQuery));
      const categoryMatch = food.category.toLowerCase().includes(displayQuery);
      return nameMatch || keywordMatch || categoryMatch;
    };

    const rank = (food: FoodItem) => {
      if (food.name.toLowerCase() === displayQuery) return 0;
      if (food.name.toLowerCase().startsWith(displayQuery)) return 1;
      return 2;
    };

    const personalMatches = personalFoods.filter(matches).sort((a, b) => rank(a) - rank(b));
    const publicMatches = allFoods
      .filter(matches)
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 10);

    return [...personalMatches, ...publicMatches].slice(0, 12);
  }, [displayQuery, allFoods, personalFoods]);

  function clear() {
    setQuery("");
    setDisplayQuery("");
  }

  return { query, setQuery, results, loading, clear };
}
