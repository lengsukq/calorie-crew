import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { achievements, foodLogs } from "@/lib/db/schema";
import { addDays, todayDate } from "@/lib/date";
import { ACHIEVEMENT_DEFINITIONS } from "@/shared/constants";

export interface AchievementState {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface EngagementData {
  currentStreak: number;
  longestStreak: number;
  totalFoodLogs: number;
  achievements: AchievementState[];
}

function computeStreaks(sortedDatesAsc: string[]): { current: number; longest: number } {
  if (sortedDatesAsc.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let running = 1;
  for (let index = 1; index < sortedDatesAsc.length; index += 1) {
    const expected = addDays(sortedDatesAsc[index - 1], 1);
    if (sortedDatesAsc[index] === expected) {
      running += 1;
    } else {
      running = 1;
    }
    longest = Math.max(longest, running);
  }

  const today = todayDate();
  const yesterday = addDays(today, -1);
  const latest = sortedDatesAsc[sortedDatesAsc.length - 1];
  if (latest !== today && latest !== yesterday) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let index = sortedDatesAsc.length - 1; index > 0; index -= 1) {
    const expectedPrev = addDays(sortedDatesAsc[index], -1);
    if (sortedDatesAsc[index - 1] === expectedPrev) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest };
}

export async function getEngagement(userId: string): Promise<EngagementData> {
  const [dateRows, totalRows, unlockedRows] = await Promise.all([
    db
      .selectDistinct({ logDate: foodLogs.logDate })
      .from(foodLogs)
      .where(eq(foodLogs.userId, userId))
      .orderBy(asc(foodLogs.logDate)),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(foodLogs)
      .where(eq(foodLogs.userId, userId)),
    db.query.achievements.findMany({ where: eq(achievements.userId, userId) }),
  ]);

  const sortedDates = dateRows.map((row) => row.logDate);
  const { current, longest } = computeStreaks(sortedDates);
  const totalFoodLogs = totalRows[0]?.value ?? 0;

  const metricValues: Record<string, number> = {
    foodLogs: totalFoodLogs,
    streak: longest,
  };

  const unlockedMap = new Map(unlockedRows.map((row) => [row.achievementId, row.unlockedAt]));

  const newlyUnlocked: string[] = [];
  const achievementStates: AchievementState[] = ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = metricValues[definition.metric] ?? 0;
    const earned = progress >= definition.target;
    const existingUnlockedAt = unlockedMap.get(definition.id);
    if (earned && !existingUnlockedAt) {
      newlyUnlocked.push(definition.id);
    }
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      target: definition.target,
      progress: Math.min(progress, definition.target),
      unlocked: earned || Boolean(existingUnlockedAt),
      unlockedAt: existingUnlockedAt ? existingUnlockedAt.toISOString() : null,
    };
  });

  if (newlyUnlocked.length > 0) {
    await db
      .insert(achievements)
      .values(newlyUnlocked.map((achievementId) => ({ userId, achievementId })))
      .onConflictDoNothing();
    for (const state of achievementStates) {
      if (newlyUnlocked.includes(state.id)) {
        state.unlocked = true;
        state.unlockedAt = new Date().toISOString();
      }
    }
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    totalFoodLogs,
    achievements: achievementStates,
  };
}
