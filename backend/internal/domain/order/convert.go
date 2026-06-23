package order

import (
	"fmt"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// mustParseUUID parses a UUID string into [16]byte. Safe to use after Gin's
// binding:"uuid" validator has already confirmed the string is well-formed.
func mustParseUUID(s string) [16]byte {
	u, err := uuid.Parse(s)
	if err != nil {
		// Should be unreachable given upstream "uuid" binding validation,
		// but fail loudly rather than silently producing a zero UUID.
		panic("invalid uuid reached service layer: " + s)
	}
	return u
}

func mustUUIDBytes(s string) [16]byte {
	return mustParseUUID(s)
}

func uuidString(u pgtype.UUID) string {
	parsed := uuid.UUID(u.Bytes)
	return parsed.String()
}

// pgUUID converts a raw [16]byte (as produced by mustParseUUID) into the
// pgtype.UUID shape sqlc expects for query parameters.
func pgUUID(b [16]byte) pgtype.UUID {
	return pgtype.UUID{Bytes: b, Valid: true}
}

// orderToResponse maps a raw sqlc.Order row into the base OrderResponse
// shape. Callers (GetByOrderNumber, ListOrders, UpdateStatus) attach
// Items/Catering on top of this where needed.
func orderToResponse(o sqlc.Order) *OrderResponse {
	subtotal, _ := o.Subtotal.Float64Value()
	return &OrderResponse{
		ID:             uuid.UUID(o.ID.Bytes).String(),
		OrderNumber:    o.OrderNumber,
		OrderType:      o.OrderType,
		Status:         o.Status,
		DeliveryMethod: o.DeliveryMethod,
		DeliveryAddr:   o.DeliveryAddress.String,
		ContactPhone:   o.ContactPhone,
		PaymentMethod:  o.PaymentMethod,
		PaymentStatus:  o.PaymentStatus,
		Subtotal:       fmt.Sprintf("%.2f", subtotal.Float64),
		CustomerNotes:  o.CustomerNotes.String,
		CreatedAt:      o.CreatedAt.Time,
	}
}

// pgtypeNumeric converts a float64 into pgtype.Numeric for inserting into
// NUMERIC(10,2) columns. Uses string scanning which is the most reliable
// path — pgtype.Numeric.Scan(float64) can silently produce a null value.
func pgtypeNumeric(f float64) pgtype.Numeric {
	var n pgtype.Numeric
	if err := n.Scan(fmt.Sprintf("%.2f", f)); err != nil {
		// fallback: zero rather than null, so the NOT NULL constraint
		// never fires even if formatting somehow fails
		_ = n.Scan("0.00")
	}
	return n
}
