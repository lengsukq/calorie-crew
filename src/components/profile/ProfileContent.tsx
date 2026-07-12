"use client";

import { useUserTarget } from "@/hooks/useUserTarget";
import { TargetSetting } from "@/components/profile/TargetSetting";
import { AdminPanel } from "@/components/profile/AdminPanel";

interface ProfileContentProps {
  email: string;
  role: string;
  calorieTarget: number;
}

export function ProfileContent({ email, role, calorieTarget }: ProfileContentProps) {
  const { updateTarget } = useUserTarget();

  async function handleCreateInvite(maxUses: number): Promise<string | null> {
    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ maxUses }),
      });
      const result = (await response.json()) as {
        invite?: { code: string };
        error?: string;
      };
      return result.invite?.code ?? null;
    } catch {
      return null;
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="stack page-enter">
      {/* User card */}
      <div className="glass-card flex flex-col items-center py-6">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400 shadow-xl">
          <span className="text-3xl font-bold text-white">
            {email.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-700">{email}</p>
        <span className="glass-tag mt-1">{role}</span>
      </div>

      {/* Calorie target */}
      <TargetSetting currentTarget={calorieTarget} onUpdate={updateTarget} />

      {/* Notification history */}
      <div className="glass-card">
        <div className="flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span className="text-sm font-semibold text-slate-700">通知历史</span>
        </div>
        <div className="mt-3">
          <p className="text-xs text-slate-400">暂无通知</p>
        </div>
      </div>

      {/* Admin section */}
      {role === "admin" && <AdminPanel onCreateInvite={handleCreateInvite} />}

      {/* About */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span className="text-sm font-semibold text-slate-700">关于</span>
          </div>
          <span className="text-xs text-slate-400">v0.1.0</span>
        </div>
      </div>

      {/* Logout button */}
      <button onClick={handleLogout} className="glass-button-danger w-full">
        退出登录
      </button>
    </div>
  );
}
