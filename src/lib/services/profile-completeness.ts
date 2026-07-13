import type { ProfileCompleteness, UserProfileData } from "@/shared/types";

const PROFILE_COMPLETENESS_FIELDS = [
  "displayName",
  "birthDate",
  "heightCm",
  "weightTargetKg",
] as const;

function isFieldFilled(profile: UserProfileData, field: string): boolean {
  const value = profile[field as keyof UserProfileData];
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function calculateCompleteness(profile: UserProfileData): ProfileCompleteness {
  const completedFields = PROFILE_COMPLETENESS_FIELDS.filter((field) => isFieldFilled(profile, field));
  const missingFields = PROFILE_COMPLETENESS_FIELDS.filter((field) => !isFieldFilled(profile, field));
  const percentage = Math.round((completedFields.length / PROFILE_COMPLETENESS_FIELDS.length) * 100);

  return { completedFields, missingFields, percentage };
}
