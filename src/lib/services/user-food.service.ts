import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userFoods } from "@/lib/db/schema";

export interface UserFoodWriteInput {
  name: string;
  servingDescription?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type UserFoodUpdateInput = Partial<UserFoodWriteInput> & {
  isFavorite?: boolean;
};

export async function listUserFoods(userId: string) {
  return db.query.userFoods.findMany({
    where: eq(userFoods.userId, userId),
    orderBy: [desc(userFoods.isFavorite), desc(userFoods.usageCount), desc(userFoods.createdAt)],
  });
}

export async function createUserFood(userId: string, data: UserFoodWriteInput) {
  const [food] = await db
    .insert(userFoods)
    .values({
      userId,
      name: data.name.trim(),
      servingDescription: data.servingDescription?.trim() ?? "",
      calories: data.calories,
      proteinG: data.proteinG.toFixed(2),
      carbsG: data.carbsG.toFixed(2),
      fatG: data.fatG.toFixed(2),
    })
    .returning();
  return food;
}

export async function updateUserFood(userId: string, id: string, data: UserFoodUpdateInput) {
  const updateValues = {
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.servingDescription !== undefined ? { servingDescription: data.servingDescription.trim() } : {}),
    ...(data.calories !== undefined ? { calories: data.calories } : {}),
    ...(data.proteinG !== undefined ? { proteinG: data.proteinG.toFixed(2) } : {}),
    ...(data.carbsG !== undefined ? { carbsG: data.carbsG.toFixed(2) } : {}),
    ...(data.fatG !== undefined ? { fatG: data.fatG.toFixed(2) } : {}),
    ...(data.isFavorite !== undefined ? { isFavorite: data.isFavorite } : {}),
    updatedAt: sql`now()`,
  };

  const [food] = await db
    .update(userFoods)
    .set(updateValues)
    .where(and(eq(userFoods.id, id), eq(userFoods.userId, userId)))
    .returning();

  return food ?? null;
}

export async function incrementUserFoodUsage(userId: string, id: string) {
  const [food] = await db
    .update(userFoods)
    .set({ usageCount: sql`${userFoods.usageCount} + 1`, updatedAt: sql`now()` })
    .where(and(eq(userFoods.id, id), eq(userFoods.userId, userId)))
    .returning();
  return food ?? null;
}

export async function deleteUserFood(userId: string, id: string) {
  const [deleted] = await db
    .delete(userFoods)
    .where(and(eq(userFoods.id, id), eq(userFoods.userId, userId)))
    .returning();
  return deleted ?? null;
}
