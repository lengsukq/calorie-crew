import { apiFetch } from "@/lib/api/client";

interface UpdateTargetResponse {
  success: boolean;
}

export function updateCalorieTarget(calorieTarget: number): Promise<UpdateTargetResponse> {
  return apiFetch<UpdateTargetResponse>("/api/users/target", {
    method: "PUT",
    body: JSON.stringify({ calorieTarget }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}
