// Mirrors internal/domain/product/dto.go ProductResponse / VariantResponse
export interface Variant {
  id: string;
  sku: string;
  grind_type?: string;
  weight_grams: number;
  price: string; // decimal as string, e.g. "350.00" — format for display, don't do math on it client-side
  stock_quantity: number;
  in_stock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  variants: Variant[];
}

// Mirrors internal/domain/catering/dto.go PackageResponse
export interface CateringPackage {
  id: string;
  name: string;
  description?: string;
  price_per_guest?: string;
  flat_price?: string;
  min_guests?: number;
  image_url?: string;
}

// Mirrors internal/domain/order/dto.go CreateOrderRequest and friends
export interface OrderItemInput {
  product_variant_id: string;
  quantity: number;
}

export interface CateringInput {
  catering_package_id?: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string;
  guest_count: number;
  venue_address?: string;
  custom_request?: string;
}

export interface CreateOrderInput {
  order_type: "product" | "catering";
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: "pickup" | "delivery";
  delivery_address?: string;
  customer_notes?: string;
  items?: OrderItemInput[];
  catering?: CateringInput;
}

export interface OrderItemResponse {
  product_name: string;
  grind_type?: string;
  weight_grams: number;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface CateringDetailResponse {
  event_date: string;
  event_time?: string;
  guest_count: number;
  venue_address?: string;
  custom_request?: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: "product" | "catering";
  status: string;
  delivery_method: "pickup" | "delivery";
  delivery_address?: string;
  contact_phone: string;
  payment_method: string;
  payment_status: string;
  subtotal: string;
  customer_notes?: string;
  created_at: string;
  items?: OrderItemResponse[];
  catering?: CateringDetailResponse;
}

// Generic API envelope shapes (see internal/pkg/response/response.go)
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
}