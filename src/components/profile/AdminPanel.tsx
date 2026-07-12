"use client";

import { useState } from "react";
import { toast } from "sonner";

interface AdminPanelProps {
  onCreateInvite: (maxUses: number) => Promise<string | null>;
}

export function AdminPanel({ onCreateInvite }: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const code = await onCreateInvite(maxUses);
      if (code) {
        setInviteCode(code);
        toast.success("邀请码已创建");
      } else {
        toast.error("创建失败");
      }
    } catch {
      toast.error("创建邀请码失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card border-amber-200/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔐</span>
          <span className="text-sm font-semibold text-slate-700">邀请码管理</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="stack gap-1.5">
              <span className="glass-label">可使用次数</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="glass-input w-24"
              />
            </label>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="glass-button !px-4 !py-2 text-sm"
            >
              {loading ? "生成中..." : "生成邀请码"}
            </button>
          </div>

          {inviteCode && (
            <div className="glass-message-success flex items-center gap-3">
              <span className="text-sm font-medium">邀请码：</span>
              <code className="rounded-lg bg-cyan-50 px-3 py-1 font-mono text-sm text-cyan-700">
                {inviteCode}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
