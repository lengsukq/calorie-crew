import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, role: true, calorieTarget: true },
  });
  if (!user) redirect("/login");

  return (
    <ProfileContent
      email={user.email}
      role={user.role}
      calorieTarget={user.calorieTarget}
    />
  );
}
