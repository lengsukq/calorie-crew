import { apiFetch } from "@/lib/api/client";
import type { ProfileResponseData, UserProfileFormData } from "@/shared/types";

export function fetchProfile(): Promise<ProfileResponseData> {
  return apiFetch<ProfileResponseData>("/api/profile");
}

export function saveProfile(data: UserProfileFormData): Promise<ProfileResponseData> {
  return apiFetch<ProfileResponseData>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
