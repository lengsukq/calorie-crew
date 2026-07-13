import { describe, expect, it } from "vitest";
import { calculateCompleteness } from "@/lib/services/profile-completeness";
import type { UserProfileData } from "@/shared/types";

function buildProfile(overrides: Partial<UserProfileData> = {}): UserProfileData {
  return {
    displayName: null,
    birthDate: null,
    gender: "male",
    heightCm: null,
    activityLevel: "sedentary",
    healthGoal: "general_health",
    weightTargetKg: null,
    aiAdviceEnabled: true,
    aiAdviceFrequency: "daily",
    ...overrides,
  };
}

describe("calculateCompleteness", () => {
  it("returns 0% when no nullable fields are filled", () => {
    const result = calculateCompleteness(buildProfile());
    expect(result.percentage).toBe(0);
    expect(result.completedFields).toEqual([]);
    expect(result.missingFields).toEqual([
      "displayName",
      "birthDate",
      "heightCm",
      "weightTargetKg",
    ]);
  });

  it("returns 100% when all nullable fields are filled", () => {
    const result = calculateCompleteness(
      buildProfile({
        displayName: "张三",
        birthDate: "1995-06-15",
        heightCm: 175,
        weightTargetKg: "65.00",
      }),
    );
    expect(result.percentage).toBe(100);
    expect(result.missingFields).toEqual([]);
    expect(result.completedFields).toHaveLength(4);
  });

  it("treats whitespace-only displayName as missing", () => {
    const result = calculateCompleteness(buildProfile({ displayName: "   " }));
    expect(result.missingFields).toContain("displayName");
    expect(result.completedFields).not.toContain("displayName");
  });

  it("returns correct percentage for partially filled profile", () => {
    const result = calculateCompleteness(
      buildProfile({
        heightCm: 160,
        weightTargetKg: "55.00",
      }),
    );
    expect(result.percentage).toBe(50);
    expect(result.completedFields).toEqual(["heightCm", "weightTargetKg"]);
    expect(result.missingFields).toEqual(["displayName", "birthDate"]);
  });
});
