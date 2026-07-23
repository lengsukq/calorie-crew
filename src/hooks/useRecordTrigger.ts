"use client";

import { useEffect } from "react";

/** 跨组件触发"打开记录弹窗"的自定义事件名 */
export const OPEN_RECORD_EVENT = "caloriecrew:open-record";

/** 跨页跳转后用于标记"需要自动打开记录弹窗"的 sessionStorage key */
const OPEN_RECORD_FLAG = "caloriecrew:open-record";

/**
 * 派发"打开记录"信号。
 * - 若当前已在记录页（today/diary），直接派发事件，由页面内监听器打开弹窗。
 * - 否则写入 sessionStorage 标志并跳转到目标页，目标页挂载时消费标志自动打开。
 */
export function dispatchOpenRecord(options: {
  onCurrentPage: boolean;
  navigate: (href: "/today") => void;
}): void {
  if (options.onCurrentPage) {
    window.dispatchEvent(new CustomEvent(OPEN_RECORD_EVENT));
    return;
  }
  try {
    sessionStorage.setItem(OPEN_RECORD_FLAG, "1");
  } catch {
    /* sessionStorage 不可用时退化为仅跳转 */
  }
  options.navigate("/today");
}

/**
 * 在记录页（today/diary）监听"打开记录"信号：
 * - 挂载时消费 sessionStorage 标志（跨页跳转场景）。
 * - 持续监听自定义事件（同页中央按钮场景）。
 */
export function useRecordTrigger(open: () => void): void {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(OPEN_RECORD_FLAG)) {
        sessionStorage.removeItem(OPEN_RECORD_FLAG);
        open();
      }
    } catch {
      /* sessionStorage 不可用时忽略 */
    }

    function handleOpen() {
      open();
    }
    window.addEventListener(OPEN_RECORD_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_RECORD_EVENT, handleOpen);
  }, [open]);
}
