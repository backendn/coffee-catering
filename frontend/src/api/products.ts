import { apiClient } from "./client";
import type { ApiSuccess, Product, Variant } from "../types";

export async function listProducts(): Promise<Product[]> {
  const res = await apiClient.get<ApiSuccess<Product[]>>("/products");
  return res.data.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await apiClient.get<ApiSuccess<Product>>(`/products/${slug}`);
  return res.data.data;
}

// --- Admin ---

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export async function createProductAdmin(input: CreateProductInput): Promise<Product> {
  const res = await apiClient.post<ApiSuccess<Product>>("/admin/products", input);
  return res.data.data;
}

export async function updateProductAdmin(id: string, input: CreateProductInput): Promise<Product> {
  const res = await apiClient.put<ApiSuccess<Product>>(`/admin/products/${id}`, input);
  return res.data.data;
}

export async function deleteProductAdmin(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export interface CreateVariantInput {
  sku: string;
  grind_type?: string;
  weight_grams: number;
  price: string;
  stock_quantity: number;
}

export async function createVariantAdmin(productId: string, input: CreateVariantInput): Promise<Variant> {
  const res = await apiClient.post<ApiSuccess<Variant>>(`/admin/products/${productId}/variants`, input);
  return res.data.data;
}

export async function updateVariantStockAdmin(variantId: string, stockQuantity: number): Promise<Variant> {
  const res = await apiClient.patch<ApiSuccess<Variant>>(`/admin/variants/${variantId}/stock`, {
    stock_quantity: stockQuantity,
  });
  return res.data.data;
}

export interface UpdateVariantInput {
  sku: string;
  grind_type?: string;
  weight_grams: number;
  price: string;
  stock_quantity: number;
}

export async function updateVariantAdmin(variantId: string, input: UpdateVariantInput): Promise<Variant> {
  const res = await apiClient.put<ApiSuccess<Variant>>(`/admin/variants/${variantId}`, input);
  return res.data.data;
}

export async function deleteVariantAdmin(variantId: string): Promise<void> {
  await apiClient.delete(`/admin/variants/${variantId}`);
}