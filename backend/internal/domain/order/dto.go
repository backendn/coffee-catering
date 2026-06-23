package order

import "time"

// CreateOrderRequest covers both order types. Frontend sends order_type =
// "product" or "catering" and includes only the relevant sub-object.
type CreateOrderRequest struct {
	OrderType      string          `json:"order_type" binding:"required,oneof=product catering"`
	CustomerName   string          `json:"customer_name" binding:"required,min=2"`
	CustomerPhone  string          `json:"customer_phone" binding:"required,min=9"`
	CustomerEmail  string          `json:"customer_email" binding:"omitempty,email"`
	DeliveryMethod string          `json:"delivery_method" binding:"required,oneof=pickup delivery"`
	DeliveryAddr   string          `json:"delivery_address" binding:"required_if=DeliveryMethod delivery"`
	CustomerNotes  string          `json:"customer_notes"`
	Items          []OrderItemReq  `json:"items" binding:"required_if=OrderType product,omitempty,dive"`
	Catering       *CateringReq    `json:"catering" binding:"required_if=OrderType catering"`
}

type OrderItemReq struct {
	ProductVariantID string `json:"product_variant_id" binding:"required,uuid"`
	Quantity         int32  `json:"quantity" binding:"required,gt=0"`
}

type CateringReq struct {
	CateringPackageID string `json:"catering_package_id" binding:"omitempty,uuid"`
	EventDate         string `json:"event_date" binding:"required"` // "2026-07-20"
	EventTime         string `json:"event_time"`                    // "14:00", optional
	GuestCount        int32  `json:"guest_count" binding:"required,gt=0"`
	VenueAddress      string `json:"venue_address"`
	CustomRequest     string `json:"custom_request"`
}

// OrderResponse is what gets returned to the customer after order creation
// and what the admin order-detail view consumes.
type OrderResponse struct {
	ID             string             `json:"id"`
	OrderNumber    string             `json:"order_number"`
	OrderType      string             `json:"order_type"`
	Status         string             `json:"status"`
	DeliveryMethod string             `json:"delivery_method"`
	DeliveryAddr   string             `json:"delivery_address,omitempty"`
	ContactPhone   string             `json:"contact_phone"`
	PaymentMethod  string             `json:"payment_method"`
	PaymentStatus  string             `json:"payment_status"`
	Subtotal       string             `json:"subtotal"`
	CustomerNotes  string             `json:"customer_notes,omitempty"`
	CreatedAt      time.Time          `json:"created_at"`
	Items          []OrderItemResp    `json:"items,omitempty"`
	Catering       *CateringDetailResp `json:"catering,omitempty"`
}

type OrderItemResp struct {
	ProductName string `json:"product_name"`
	GrindType   string `json:"grind_type,omitempty"`
	WeightGrams int32  `json:"weight_grams"`
	Quantity    int32  `json:"quantity"`
	UnitPrice   string `json:"unit_price"`
	LineTotal   string `json:"line_total"`
}

type CateringDetailResp struct {
	EventDate     string `json:"event_date"`
	EventTime     string `json:"event_time,omitempty"`
	GuestCount    int32  `json:"guest_count"`
	VenueAddress  string `json:"venue_address,omitempty"`
	CustomRequest string `json:"custom_request,omitempty"`
}

// UpdateOrderStatusRequest is used by the admin order-processing UI.
type UpdateOrderStatusRequest struct {
	Status     string `json:"status" binding:"required,oneof=pending confirmed preparing ready out_for_delivery completed cancelled"`
	AdminNote  string `json:"admin_note"`
}

// ListOrdersQuery covers admin queue filtering/pagination.
type ListOrdersQuery struct {
	Status string `form:"status"`
	Limit  int32  `form:"limit,default=20"`
	Offset int32  `form:"offset,default=0"`
}