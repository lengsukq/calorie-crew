import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/services/user.service";
import { TodayContent } from "@/components/today/TodayContent";

export default async function TodayPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await getUserProfile(userId);
  if (!user) redirect("/login");

  return (
    <TodayContent
      email={user.email}
      role={user.role}
      calorieTarget={user.calorieTarget}
      weightTargetKg={user.weightTargetKg}
    />
  );
}
