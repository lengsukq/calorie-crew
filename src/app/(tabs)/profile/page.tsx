import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/services/user.service";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await getUserProfile(userId);
  if (!user) redirect("/login");

  return (
    <ProfileContent
      email={user.email}
      role={user.role}
      calorieTarget={user.calorieTarget}
      weightTargetKg={user.weightTargetKg}
    />
  );
}
