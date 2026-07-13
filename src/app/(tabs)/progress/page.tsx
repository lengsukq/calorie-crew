import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/services/user.service";
import { ProgressContent } from "@/components/progress/ProgressContent";

export default async function ProgressPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await getUserProfile(userId);
  if (!user) redirect("/login");

  return <ProgressContent weightTargetKg={user.weightTargetKg} />;
}
