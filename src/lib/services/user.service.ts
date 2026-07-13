import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function getUserProfile(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, role: true, calorieTarget: true, weightTargetKg: true },
  });
}
