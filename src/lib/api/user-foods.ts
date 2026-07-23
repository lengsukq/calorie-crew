import { apiFetch } from "@/lib/api/client";
import type { UserFoodEntry, UserFoodFormData } from "@/shared/types";

interface UserFoodsResponse {
  foods: UserFoodEntry[];
}

interface UserFoodResponse {
  food: UserFoodEntry;
}

export function fetchUserFoods(): Promise<UserFoodsResponse> {
  return apiFetch<UserFoodsResponse>("/api/user-foods");
}

export function createUserFood(data: UserFoodFormData): Promise<UserFoodResponse> {
  return apiFetch<UserFoodResponse>("/api/user-foods", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUserFood(
  id: string,
  data: Partial<UserFoodFormData> & { isFavorite?: boolean },
): Promise<UserFoodResponse> {
  return apiFetch<UserFoodResponse>(`/api/user-foods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteUserFood(id: string): Promise<void> {
  return apiFetch<void>(`/api/user-foods/${id}`, { method: "DELETE" });
}

export function markUserFoodUsed(id: string): Promise<UserFoodResponse> {
  return apiFetch<UserFoodResponse>(`/api/user-foods/${id}/use`, { method: "POST" });
}
