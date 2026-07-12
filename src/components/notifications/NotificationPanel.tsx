"use client";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications: { id: string; text: string; time: string }[] = [];

  return (
    <div className="notification-panel">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-700">通知</h3>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          关闭
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          暂无通知
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="notification-item">
              <p className="flex-1 text-slate-600">{n.text}</p>
              <span className="shrink-0 text-xs text-slate-400">{n.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
