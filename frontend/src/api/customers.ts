import { apiClient } from "./client";
import type { ApiSuccess } from "../types";

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  order_count: number;
  created_at: string;
}

export interface ListCustomersParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listCustomersAdmin(params: ListCustomersParams = {}): Promise<Customer[]> {
  const res = await apiClient.get<ApiSuccess<Customer[]>>("/admin/customers", { params });
  return res.data.data;
}