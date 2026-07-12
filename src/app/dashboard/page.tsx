import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { email: true, role: true } });
  if (!user) redirect("/login");
  return <main><Dashboard email={user.email} role={user.role} /></main>;
}
