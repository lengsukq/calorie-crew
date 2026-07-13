import { ProgressContent } from "@/components/progress/ProgressContent";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { weightTargetKg: true },
  });
  if (!user) redirect("/login");

  return <ProgressContent weightTargetKg={user.weightTargetKg} />;
}
