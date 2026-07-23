"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { Target, HeartPulse, User, Sparkles, Bot, KeyRound, Info, LogOut } from "lucide-react";
import { useUserTarget } from "@/hooks/useUserTarget";
import { useProfile } from "@/hooks/useProfile";
import { createInvite } from "@/lib/api/admin-invites";
import { ApiError } from "@/lib/api/client";
import { logout } from "@/lib/api/auth";
import { TargetSetting } from "@/components/profile/TargetSetting";
import { DataExportPanel } from "@/components/profile/DataExportPanel";
import { AchievementsPanel } from "@/components/profile/AchievementsPanel";
import { AdminPanel } from "@/components/profile/AdminPanel";
import { AiConfigPanel } from "@/components/profile/AiConfigPanel";
import { HealthMetricsCard } from "@/components/profile/HealthMetricsCard";
import { PersonalProfilePanel } from "@/components/profile/PersonalProfilePanel";
import { AiAdvicePreferencePanel } from "@/components/profile/AiAdvicePreferencePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentProps {
  email: string;
  role: string;
  calorieTarget: number;
  weightTargetKg: string | null;
}

export function ProfileContent({ email, role, calorieTarget, weightTargetKg }: ProfileContentProps) {
  const { updateTarget, updateWaterTarget, updateSleepTarget } = useUserTarget();
  const { data: profileData, loading: profileLoading } = useProfile();

  const profileCompleteness = profileData?.profileCompleteness.percentage ?? 0;
  const onboardingTips = useMemo(() => {
    if (!profileData?.profile) return [];
    const profile = profileData.profile;
    const tips: string[] = [];
    if (!profile.displayName) tips.push("设置昵称，让记录更有归属感");
    if (!profile.birthDate) tips.push("填写出生日期，以便计算更精准的基础代谢");
    if (!profile.heightCm) tips.push("录入身高，系统才能计算 BMI 与推荐摄入");
    if (!profile.weightTargetKg) tips.push("设定体重目标，方便追踪长期趋势");
    return tips;
  }, [profileData?.profile]);

  async function handleCreateInvite(maxUses: number): Promise<string | null> {
    try {
      const result = await createInvite({ maxUses });
      return result.invite.code;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "创建邀请码失败";
      toast.error(message);
      return null;
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="stack page-enter">
      {/* User card */}
      <Card>
        <CardContent className="flex flex-col items-center py-6">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-3xl font-bold">{email.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{email}</p>
          <Badge variant={role === "admin" ? "default" : "secondary"} className="mt-1">
            {role === "admin" ? "管理员" : "会员"}
          </Badge>
        </CardContent>
      </Card>

      {/* Onboarding guidance */}
      {!profileLoading && profileData && profileCompleteness < 100 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">完善资料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">完成度</span>
              <span className="font-medium tabular-nums">{profileCompleteness}%</span>
            </div>
            <Progress value={profileCompleteness} max={100} />
            <ul className="space-y-1.5">
              {onboardingTips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Settings section */}
      <div className="space-y-3">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">设置</p>
        <TargetSetting
          calorieTarget={calorieTarget}
          waterTargetMl={profileData?.profile.waterTargetMl ?? 2000}
          sleepTargetMinutes={profileData?.profile.sleepTargetMinutes ?? 480}
          onUpdateCalorie={updateTarget}
          onUpdateWater={updateWaterTarget}
          onUpdateSleep={updateSleepTarget}
        />
        <DataExportPanel />
        <AchievementsPanel />
        <HealthMetricsCard />
        <Accordion type="multiple" defaultValue={!weightTargetKg ? ["profile"] : undefined} className="space-y-3">
          <AccordionItem value="profile" className="rounded-lg border bg-card px-4">
            <AccordionTrigger className="py-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">个人健康档案</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <PersonalProfilePanel />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ai-preference" className="rounded-lg border bg-card px-4">
            <AccordionTrigger className="py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI 建议偏好</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AiAdvicePreferencePanel />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ai-config" className="rounded-lg border bg-card px-4">
            <AccordionTrigger className="py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI 配置</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AiConfigPanel />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Admin section */}
      {role === "admin" && (
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">管理员</p>
          <AdminPanel onCreateInvite={handleCreateInvite} />
        </div>
      )}

      {/* About section */}
      <div className="space-y-3">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">关于</p>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">CalorieCrew</span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">v0.2.0</span>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        退出登录
      </Button>
    </div>
  );
}
