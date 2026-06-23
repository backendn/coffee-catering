import { apiClient } from "./client";
import type { ApiSuccess, CreateOrderInput, Order } from "../types";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await apiClient.post<ApiSuccess<Order>>("/orders", input);
  return res.data.data;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const res = await apiClient.get<ApiSuccess<Order>>(`/orders/${orderNumber}`);
  return res.data.data;
}

// --- Admin ---

export interface ListOrdersParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listOrdersAdmin(params: ListOrdersParams = {}): Promise<Order[]> {
  const res = await apiClient.get<ApiSuccess<Order[]>>("/admin/orders", { params });
  return res.data.data;
}

export async function updateOrderStatus(orderId: string, status: string, adminNote?: string): Promise<Order> {
  const res = await apiClient.patch<ApiSuccess<Order>>(`/admin/orders/${orderId}/status`, {
    status,
    admin_note: adminNote,
  });
  return res.data.data;
}