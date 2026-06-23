import { apiClient } from "./client";
import type { ApiSuccess, CateringPackage } from "../types";

export async function listCateringPackages(): Promise<CateringPackage[]> {
  const res = await apiClient.get<ApiSuccess<CateringPackage[]>>("/catering/packages");
  return res.data.data;
}

export interface Availability {
  date: string;
  existing_bookings: number;
  is_available: boolean;
}

export async function checkAvailability(date: string): Promise<Availability> {
  const res = await apiClient.get<ApiSuccess<Availability>>("/catering/availability", {
    params: { date },
  });
  return res.data.data;
}

// --- Admin ---

export interface CreatePackageInput {
  name: string;
  description?: string;
  price_per_guest?: string;
  flat_price?: string;
  min_guests?: number;
}

export async function createCateringPackageAdmin(input: CreatePackageInput): Promise<CateringPackage> {
  const res = await apiClient.post<ApiSuccess<CateringPackage>>("/admin/catering/packages", input);
  return res.data.data;
}