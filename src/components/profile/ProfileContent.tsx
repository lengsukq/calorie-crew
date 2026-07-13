"use client";

import { useMemo, useState } from "react";
import { useUserTarget } from "@/hooks/useUserTarget";
import { useProfile } from "@/hooks/useProfile";
import { TargetSetting } from "@/components/profile/TargetSetting";
import { AdminPanel } from "@/components/profile/AdminPanel";
import { AiConfigPanel } from "@/components/profile/AiConfigPanel";
import { HealthMetricsCard } from "@/components/profile/HealthMetricsCard";
import { PersonalProfilePanel } from "@/components/profile/PersonalProfilePanel";
import { AiAdvicePreferencePanel } from "@/components/profile/AiAdvicePreferencePanel";

interface ProfileContentProps {
  email: string;
  role: string;
  calorieTarget: number;
  weightTargetKg: string | null;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card !p-0 !overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/30"
        type="button"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-300 transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="border-t border-slate-100/50 px-5 py-4">{children}</div>}
    </div>
  );
}

export function ProfileContent({ email, role, calorieTarget, weightTargetKg }: ProfileContentProps) {
  const { updateTarget } = useUserTarget();
  const { data: profileData, loading: profileLoading } = useProfile();

  const profileCompleteness = useMemo(() => {
    if (!profileData?.profile) return 0;
    const fields = [
      profileData.profile.displayName,
      profileData.profile.birthDate,
      profileData.profile.heightCm,
      profileData.profile.weightTargetKg,
    ];
    const filled = fields.filter((field) => field !== null && field !== undefined && field !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [profileData?.profile]);

  const onboardingTips = useMemo(() => {
    if (!profileData?.profile) return [];
    const tips: string[] = [];
    if (!profileData.profile.displayName) tips.push("设置昵称，让记录更有归属感");
    if (!profileData.profile.birthDate) tips.push("填写出生日期，以便计算更精准的基础代谢");
    if (!profileData.profile.heightCm) tips.push("录入身高，系统才能计算 BMI 与推荐摄入");
    if (!profileData.profile.weightTargetKg) tips.push("设定体重目标，方便追踪长期趋势");
    return tips;
  }, [profileData?.profile]);

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
        <span className="glass-tag mt-1">
          {role === "admin" ? "管理员" : "会员"}
        </span>
      </div>

      {/* Onboarding guidance */}
      {!profileLoading && profileData && profileCompleteness < 100 && (
        <div className="glass-card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">完善资料</p>
            <span className="text-xs text-slate-400">{profileCompleteness}%</span>
          </div>
          <div className="mb-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          <ul className="space-y-1.5">
            {onboardingTips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="mt-0.5 text-cyan-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Settings section */}
      <div className="space-y-3">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          设置
        </p>
        <TargetSetting currentTarget={calorieTarget} onUpdate={updateTarget} />
        <HealthMetricsCard />
        <CollapsibleSection title="个人健康档案" icon="🧬" defaultOpen={!weightTargetKg}>
          <PersonalProfilePanel />
        </CollapsibleSection>
        <CollapsibleSection title="AI 建议偏好" icon="✨">
          <AiAdvicePreferencePanel />
        </CollapsibleSection>
        <CollapsibleSection title="AI 配置" icon="🤖">
          <AiConfigPanel />
        </CollapsibleSection>
      </div>

      {/* Admin section */}
      {role === "admin" && (
        <div className="space-y-3">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            管理员
          </p>
          <CollapsibleSection title="邀请码管理" icon="🔒" defaultOpen>
            <AdminPanel onCreateInvite={handleCreateInvite} />
          </CollapsibleSection>
        </div>
      )}

      {/* About section */}
      <div className="space-y-3">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          关于
        </p>
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <span className="text-sm font-semibold text-slate-700">
                CalorieCrew
              </span>
            </div>
            <span className="text-xs text-slate-400">v0.2.0</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="glass-button-danger w-full">
        退出登录
      </button>
    </div>
  );
}
