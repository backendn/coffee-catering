import { apiClient } from "./client";
import type { ApiSuccess } from "../types";

export interface AdminUser {
  id: string;
  username: string;
  full_name?: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiSuccess<LoginResponse>>("/admin/login", { username, password });
  return res.data.data;
}