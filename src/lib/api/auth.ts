import { apiFetch } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  email: string;
}

export interface MeUser extends AuthUser {
  role: string;
  calorieTarget: number;
}

interface LoginResponse {
  user: AuthUser;
}

interface RegisterResponse {
  user: AuthUser;
}

interface MeResponse {
  user: MeUser;
}

interface LogoutResponse {
  ok: boolean;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  inviteCode: string,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, inviteCode }),
  });
}

export function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me");
}

export function logout(): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>("/api/auth/logout", { method: "POST" });
}
