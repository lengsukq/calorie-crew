"use client";
// 工具型 Hook，不遵循统一数据请求签名

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    function updateMatches() {
      setMatches(mediaQueryList.matches);
    }

    updateMatches();
    mediaQueryList.addEventListener("change", updateMatches);

    return () => {
      mediaQueryList.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}
