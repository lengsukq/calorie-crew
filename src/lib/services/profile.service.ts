import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  userProfiles,
  users,
  weightLogs,
  type ActivityLevel,
  type HealthGoal,
  type ProfileGender,
} from "@/lib/db/schema";
import {
  calculateAge,
  calculateBmi,
  calculateBmr,
  calculateTdee,
  getBmiCategory,
  getSuggestedIntakeRange,
} from "@/lib/services/health-metrics.service";
import { calculateCompleteness } from "@/lib/services/profile-completeness";
import type { HealthMetricsData, ProfileResponseData, UserProfileData, UserProfileFormData } from "@/shared/types";

const DEFAULT_PROFILE: Omit<UserProfileData, "weightTargetKg"> = {
  displayName: null,
  birthDate: null,
  gender: "male",
  heightCm: null,
  activityLevel: "sedentary",
  healthGoal: "general_health",
  aiAdviceEnabled: true,
  aiAdviceFrequency: "daily",
};

interface ProfileCalculationInput {
  birthDate: string | null;
  gender: ProfileGender;
  heightCm: number | null;
  activityLevel: ActivityLevel;
  healthGoal: HealthGoal;
}

function normalizeProfileRow(
  profile: typeof userProfiles.$inferSelect | null | undefined,
  userWeightTargetKg: string | null,
): UserProfileData {
  return {
    displayName: profile?.displayName ?? DEFAULT_PROFILE.displayName,
    birthDate: profile?.birthDate ?? DEFAULT_PROFILE.birthDate,
    gender: profile?.gender ?? DEFAULT_PROFILE.gender,
    heightCm: profile?.heightCm ?? DEFAULT_PROFILE.heightCm,
    activityLevel: profile?.activityLevel ?? DEFAULT_PROFILE.activityLevel,
    healthGoal: profile?.healthGoal ?? DEFAULT_PROFILE.healthGoal,
    weightTargetKg: profile?.weightTargetKg ?? userWeightTargetKg,
    aiAdviceEnabled: profile?.aiAdviceEnabled ?? DEFAULT_PROFILE.aiAdviceEnabled,
    aiAdviceFrequency: profile?.aiAdviceFrequency ?? DEFAULT_PROFILE.aiAdviceFrequency,
  };
}

export function calculateMetrics(
  profile: ProfileCalculationInput,
  currentWeightKg: string | null,
): HealthMetricsData {
  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  const numericWeightKg = currentWeightKg ? Number(currentWeightKg) : null;

  if (!profile.heightCm || !numericWeightKg || age === null) {
    return {
      age,
      currentWeightKg,
      bmi: null,
      bmr: null,
      tdee: null,
      suggestedIntake: null,
      bmiCategory: null,
      bmiCategoryColor: null,
    };
  }

  const bmi = calculateBmi(profile.heightCm, numericWeightKg);
  const bmr = calculateBmr(profile.gender, profile.heightCm, numericWeightKg, age);
  const tdee = calculateTdee(bmr, profile.activityLevel);
  const suggestedIntake = getSuggestedIntakeRange(tdee, profile.healthGoal);
  const bmiCategory = getBmiCategory(bmi);

  return {
    age,
    currentWeightKg,
    bmi,
    bmr,
    tdee,
    suggestedIntake,
    bmiCategory: bmiCategory.label,
    bmiCategoryColor: bmiCategory.color,
  };
}

export async function getProfile(userId: string): Promise<ProfileResponseData> {
  const [user, profile, latestWeightLog] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { weightTargetKg: true },
    }),
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    }),
    db.query.weightLogs.findFirst({
      where: eq(weightLogs.userId, userId),
      orderBy: [desc(weightLogs.logDate), desc(weightLogs.createdAt)],
      columns: { weightKg: true },
    }),
  ]);

  const normalizedProfile = normalizeProfileRow(profile, user?.weightTargetKg ?? null);
  const metrics = calculateMetrics(normalizedProfile, latestWeightLog?.weightKg ?? null);
  const profileCompleteness = calculateCompleteness(normalizedProfile);

  return { profile: normalizedProfile, metrics, profileCompleteness };
}

export async function updateProfile(
  userId: string,
  data: UserProfileFormData,
): Promise<ProfileResponseData> {
  const profileUpdateData: Partial<typeof userProfiles.$inferInsert> = {
    ...(data.displayName !== undefined ? { displayName: data.displayName || null } : {}),
    ...(data.birthDate !== undefined ? { birthDate: data.birthDate } : {}),
    ...(data.gender !== undefined ? { gender: data.gender } : {}),
    ...(data.heightCm !== undefined ? { heightCm: data.heightCm } : {}),
    ...(data.activityLevel !== undefined ? { activityLevel: data.activityLevel } : {}),
    ...(data.healthGoal !== undefined ? { healthGoal: data.healthGoal } : {}),
    ...(data.weightTargetKg !== undefined
      ? { weightTargetKg: data.weightTargetKg === null ? null : data.weightTargetKg.toFixed(2) }
      : {}),
    ...(data.aiAdviceEnabled !== undefined ? { aiAdviceEnabled: data.aiAdviceEnabled } : {}),
    ...(data.aiAdviceFrequency !== undefined ? { aiAdviceFrequency: data.aiAdviceFrequency } : {}),
  };

  if (Object.keys(profileUpdateData).length > 0) {
    await db.insert(userProfiles).values({
      userId,
      ...profileUpdateData,
    }).onConflictDoUpdate({
      target: userProfiles.userId,
      set: { ...profileUpdateData, updatedAt: sql`now()` },
    });
  }

  if (data.weightTargetKg !== undefined) {
    await db.update(users).set({
      weightTargetKg: data.weightTargetKg === null ? null : data.weightTargetKg.toFixed(2),
    }).where(eq(users.id, userId));
  }

  return getProfile(userId);
}

export async function updateUserTarget(
  userId: string,
  data: { calorieTarget?: number; weightTargetKg?: number | null },
): Promise<void> {
  await db.update(users).set({
    ...(data.calorieTarget !== undefined ? { calorieTarget: data.calorieTarget } : {}),
    ...(data.weightTargetKg !== undefined
      ? { weightTargetKg: data.weightTargetKg === null ? null : data.weightTargetKg.toFixed(2) }
      : {}),
  }).where(eq(users.id, userId));
}


