import type { MealType } from "@/lib/db/schema";
import type {
  ActivityLevel,
  AiAdviceFrequency,
  AiAdviceType,
  HealthGoal,
  ProfileGender,
} from "@/lib/db/schema";

export interface FoodLogEntry {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
}

export interface DailySummary {
  totalKcal: number;
  totalExerciseKcal: number;
  netKcal: number;
  remainingKcal: number;
  totalProteinG: string;
  totalCarbsG: string;
  totalFatG: string;
}

export interface HistoryDay {
  logDate: string;
  targetKcal: number;
  totalKcal: number;
  totalExerciseKcal: number;
  netKcal: number;
  remainingKcal: number;
  totalProteinG: string;
  totalCarbsG: string;
  totalFatG: string;
}

export interface WeightLogEntry {
  id: string;
  logDate: string;
  weightKg: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeightLogFormData {
  logDate: string;
  weightKg: number;
  note?: string | null;
}

export interface ExerciseLogEntry {
  id: string;
  logDate: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseLogFormData {
  logDate: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  note?: string | null;
}

export interface FoodLogFormData {
  mealType: MealType;
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface UserProfileData {
  displayName: string | null;
  birthDate: string | null;
  gender: ProfileGender;
  heightCm: number | null;
  activityLevel: ActivityLevel;
  healthGoal: HealthGoal;
  weightTargetKg: string | null;
  aiAdviceEnabled: boolean;
  aiAdviceFrequency: AiAdviceFrequency;
}

export interface HealthMetricsData {
  age: number | null;
  currentWeightKg: string | null;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  suggestedIntake: { min: number; max: number } | null;
  bmiCategory: string | null;
  bmiCategoryColor: "blue" | "green" | "orange" | "red" | null;
}

export interface ProfileResponseData {
  profile: UserProfileData;
  metrics: HealthMetricsData;
}

export interface UserProfileFormData {
  displayName?: string | null;
  birthDate?: string | null;
  gender?: ProfileGender;
  heightCm?: number | null;
  activityLevel?: ActivityLevel;
  healthGoal?: HealthGoal;
  weightTargetKg?: number | null;
  aiAdviceEnabled?: boolean;
  aiAdviceFrequency?: AiAdviceFrequency;
}

export interface AiAdviceSuggestionData {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

export interface AiAdviceData {
  id: string;
  type: AiAdviceType;
  summary: string;
  suggestions: AiAdviceSuggestionData[];
  generatedAt: string;
  expiresAt: string;
  readAt: string | null;
  feedback: "helpful" | "not_helpful" | null;
  feedbackAt: string | null;
  completedAt: string | null;
  dismissed: boolean;
  dismissedAt: string | null;
}

export interface WaterLogEntry {
  id: string;
  logDate: string;
  amountMl: number;
  note: string | null;
  createdAt: string;
}

export interface WaterLogFormData {
  logDate: string;
  amountMl: number;
  note?: string | null;
}

export interface SleepLogEntry {
  id: string;
  logDate: string;
  sleepMinutes: number;
  quality: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SleepLogFormData {
  logDate: string;
  sleepMinutes: number;
  quality: number;
  note?: string | null;
}

export interface BodyMeasurementEntry {
  id: string;
  logDate: string;
  chestCm: string | null;
  waistCm: string | null;
  hipCm: string | null;
  armCm: string | null;
  legCm: string | null;
  note: string | null;
  createdAt: string;
}

export interface BodyMeasurementFormData {
  logDate: string;
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  legCm?: number | null;
  note?: string | null;
}
