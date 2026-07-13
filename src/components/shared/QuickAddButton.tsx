"use client";

interface QuickAddButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * Floating action button (FAB) -- 悬浮在页面右下角的快捷添加入口.
 * 在移动端固定于右下角, 桌面端固定在侧栏右下区域.
 */
export function QuickAddButton({ onClick }: QuickAddButtonProps) {
  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={onClick}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-xl shadow-cyan-300/30 transition-all duration-300 hover:scale-110 hover:shadow-cyan-300/50 active:scale-95 md:bottom-8 md:right-8"
        aria-label="添加饮食记录"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </>
  );
}
