import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TodayContent } from "@/components/today/TodayContent";

export default async function TodayPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, role: true, calorieTarget: true },
  });
  if (!user) redirect("/login");

  return (
    <TodayContent
      email={user.email}
      role={user.role}
      calorieTarget={user.calorieTarget}
    />
  );
}
