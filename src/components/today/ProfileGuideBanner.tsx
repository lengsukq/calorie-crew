"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

const REMIND_LATER_KEY = "calorie_crew_profile_remind_later";
const REMIND_LATER_HOURS = 24;
const CRITICAL_FIELDS = ["heightCm", "birthDate", "gender"];

function getRemindLaterTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(REMIND_LATER_KEY);
  if (!stored) return null;
  const timestamp = Number(stored);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isRemindLaterActive(): boolean {
  const timestamp = getRemindLaterTimestamp();
  if (timestamp === null) return false;
  const elapsedMs = Date.now() - timestamp;
  const remindLaterMs = REMIND_LATER_HOURS * 60 * 60 * 1000;
  return elapsedMs < remindLaterMs;
}

export function ProfileGuideBanner() {
  const { data: profileData, loading } = useProfile();
  const router = useRouter();
  const [remindLaterActive, setRemindLaterActive] = useState(false);

  useEffect(() => {
    setRemindLaterActive(isRemindLaterActive());
  }, []);

  if (loading || !profileData) return null;

  const { profileCompleteness } = profileData;
  if (profileCompleteness.percentage >= 100 || remindLaterActive) return null;

  const hasCriticalMissing = CRITICAL_FIELDS.some((field) =>
    profileCompleteness.missingFields.includes(field),
  );
  if (!hasCriticalMissing) return null;

  function handleRemindLater() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(REMIND_LATER_KEY, String(Date.now()));
    setRemindLaterActive(true);
  }

  function handleFillNow() {
    router.push("/profile");
  }

  return (
    <div className="glass-card flex items-center justify-between gap-3 !py-3">
      <div className="flex items-center gap-3">
        <span className="text-base">📋</span>
        <div>
          <p className="text-sm font-semibold text-slate-700">完善个人档案</p>
          <p className="text-xs text-slate-400">
            补充身高、出生日期等信息，获取更精准的健康指标与 AI 建议
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleRemindLater}
          className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-white"
        >
          稍后提醒
        </button>
        <button
          type="button"
          onClick={handleFillNow}
          className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
        >
          立即填写
        </button>
      </div>
    </div>
  );
}
