import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  bodyMeasurements,
  exerciseLogs,
  foodLogs,
  sleepLogs,
  waterLogs,
  weightLogs,
  type MealType,
} from "@/lib/db/schema";
import { MEAL_LABELS } from "@/shared/constants";
import { buildCsv, type CsvSection } from "@/lib/utils/csv";

export interface ExportRange {
  from: string;
  to: string;
}

export interface ExportData {
  range: ExportRange;
  foodLogs: typeof foodLogs.$inferSelect[];
  weightLogs: typeof weightLogs.$inferSelect[];
  exerciseLogs: typeof exerciseLogs.$inferSelect[];
  waterLogs: typeof waterLogs.$inferSelect[];
  sleepLogs: typeof sleepLogs.$inferSelect[];
  bodyMeasurements: typeof bodyMeasurements.$inferSelect[];
}

export async function getExportData(userId: string, range: ExportRange): Promise<ExportData> {
  const [foods, weights, exercises, waters, sleeps, bodies] = await Promise.all([
    db.query.foodLogs.findMany({
      where: and(eq(foodLogs.userId, userId), gte(foodLogs.logDate, range.from), lte(foodLogs.logDate, range.to)),
      orderBy: [foodLogs.logDate, foodLogs.createdAt],
    }),
    db.query.weightLogs.findMany({
      where: and(eq(weightLogs.userId, userId), gte(weightLogs.logDate, range.from), lte(weightLogs.logDate, range.to)),
      orderBy: [weightLogs.logDate, weightLogs.createdAt],
    }),
    db.query.exerciseLogs.findMany({
      where: and(eq(exerciseLogs.userId, userId), gte(exerciseLogs.logDate, range.from), lte(exerciseLogs.logDate, range.to)),
      orderBy: [exerciseLogs.logDate, exerciseLogs.createdAt],
    }),
    db.query.waterLogs.findMany({
      where: and(eq(waterLogs.userId, userId), gte(waterLogs.logDate, range.from), lte(waterLogs.logDate, range.to)),
      orderBy: [waterLogs.logDate, waterLogs.createdAt],
    }),
    db.query.sleepLogs.findMany({
      where: and(eq(sleepLogs.userId, userId), gte(sleepLogs.logDate, range.from), lte(sleepLogs.logDate, range.to)),
      orderBy: [sleepLogs.logDate, sleepLogs.createdAt],
    }),
    db.query.bodyMeasurements.findMany({
      where: and(eq(bodyMeasurements.userId, userId), gte(bodyMeasurements.logDate, range.from), lte(bodyMeasurements.logDate, range.to)),
      orderBy: [bodyMeasurements.logDate, bodyMeasurements.createdAt],
    }),
  ]);

  return {
    range,
    foodLogs: foods,
    weightLogs: weights,
    exerciseLogs: exercises,
    waterLogs: waters,
    sleepLogs: sleeps,
    bodyMeasurements: bodies,
  };
}

function mealLabel(mealType: string): string {
  return MEAL_LABELS[mealType as MealType] ?? mealType;
}

export function buildExportCsv(data: ExportData): string {
  const sections: CsvSection[] = [
    {
      title: "饮食记录",
      headers: ["日期", "餐次", "食物", "份量", "热量(kcal)", "蛋白质(g)", "碳水(g)", "脂肪(g)", "备注"],
      rows: data.foodLogs.map((log) => [
        log.logDate,
        mealLabel(log.mealType),
        log.foodName,
        log.servingDescription,
        log.calories,
        log.proteinG,
        log.carbsG,
        log.fatG,
        log.note,
      ]),
    },
    {
      title: "体重记录",
      headers: ["日期", "体重(kg)", "备注"],
      rows: data.weightLogs.map((log) => [log.logDate, log.weightKg, log.note]),
    },
    {
      title: "运动记录",
      headers: ["日期", "运动类型", "时长(分钟)", "消耗(kcal)", "备注"],
      rows: data.exerciseLogs.map((log) => [log.logDate, log.exerciseType, log.durationMinutes, log.caloriesBurned, log.note]),
    },
    {
      title: "饮水记录",
      headers: ["日期", "饮水量(ml)", "备注"],
      rows: data.waterLogs.map((log) => [log.logDate, log.amountMl, log.note]),
    },
    {
      title: "睡眠记录",
      headers: ["日期", "睡眠时长(分钟)", "质量(1-5)", "备注"],
      rows: data.sleepLogs.map((log) => [log.logDate, log.sleepMinutes, log.quality, log.note]),
    },
    {
      title: "身体数据",
      headers: ["日期", "胸围(cm)", "腰围(cm)", "臀围(cm)", "臂围(cm)", "腿围(cm)", "备注"],
      rows: data.bodyMeasurements.map((log) => [
        log.logDate,
        log.chestCm,
        log.waistCm,
        log.hipCm,
        log.armCm,
        log.legCm,
        log.note,
      ]),
    },
  ];

  return buildCsv(sections);
}

export function countExportRows(data: ExportData): number {
  return (
    data.foodLogs.length +
    data.weightLogs.length +
    data.exerciseLogs.length +
    data.waterLogs.length +
    data.sleepLogs.length +
    data.bodyMeasurements.length
  );
}
