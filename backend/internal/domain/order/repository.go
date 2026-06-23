package order

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
)

// Repository wraps the sqlc-generated Queries for the order domain.
// It exists as its own type (rather than using sqlc.Queries directly in
// the service) so the service depends on a domain-owned interface, not
// generated code — matching the repository-per-domain pattern from UICAS.
type Repository struct {
	q *sqlc.Queries
}

func NewRepository(q *sqlc.Queries) *Repository {
	return &Repository{q: q}
}

// WithTx returns a new Repository bound to the given transaction's Queries,
// used inside Service.execTx so all repo calls within a transaction share
// the same underlying tx.
func (r *Repository) WithTx(tx pgx.Tx) *Repository {
	return &Repository{q: r.q.WithTx(tx)}
}

// --- Customers ---

func (r *Repository) GetCustomerByPhone(ctx context.Context, phone string) (sqlc.Customer, error) {
	return r.q.GetCustomerByPhone(ctx, phone)
}

func (r *Repository) CreateCustomer(ctx context.Context, arg sqlc.CreateCustomerParams) (sqlc.Customer, error) {
	return r.q.CreateCustomer(ctx, arg)
}

// --- Orders ---

func (r *Repository) NextOrderNumber(ctx context.Context) (int64, error) {
	return r.q.NextOrderNumber(ctx)
}

func (r *Repository) CreateOrder(ctx context.Context, arg sqlc.CreateOrderParams) (sqlc.Order, error) {
	return r.q.CreateOrder(ctx, arg)
}

func (r *Repository) GetOrderByID(ctx context.Context, id [16]byte) (sqlc.Order, error) {
	return r.q.GetOrderByID(ctx, pgUUID(id))
}

func (r *Repository) GetOrderByOrderNumber(ctx context.Context, orderNumber string) (sqlc.Order, error) {
	return r.q.GetOrderByOrderNumber(ctx, orderNumber)
}

func (r *Repository) ListOrders(ctx context.Context, arg sqlc.ListOrdersParams) ([]sqlc.Order, error) {
	return r.q.ListOrders(ctx, arg)
}

func (r *Repository) UpdateOrderStatus(ctx context.Context, arg sqlc.UpdateOrderStatusParams) (sqlc.Order, error) {
	return r.q.UpdateOrderStatus(ctx, arg)
}

// --- Order items ---

func (r *Repository) CreateOrderItem(ctx context.Context, arg sqlc.CreateOrderItemParams) (sqlc.OrderItem, error) {
	return r.q.CreateOrderItem(ctx, arg)
}

func (r *Repository) ListOrderItemsByOrderID(ctx context.Context, orderID [16]byte) ([]sqlc.ListOrderItemsByOrderIDRow, error) {
	return r.q.ListOrderItemsByOrderID(ctx, pgUUID(orderID))
}

// --- Product variants (read/lock/decrement only — variant CRUD belongs to the product domain) ---

func (r *Repository) GetVariantForUpdate(ctx context.Context, id [16]byte) (sqlc.ProductVariant, error) {
	return r.q.GetVariantForUpdate(ctx, pgUUID(id))
}

func (r *Repository) DecrementVariantStock(ctx context.Context, arg sqlc.DecrementVariantStockParams) error {
	return r.q.DecrementVariantStock(ctx, arg)
}

// --- Catering ---

func (r *Repository) CreateCateringDetails(ctx context.Context, arg sqlc.CreateCateringDetailsParams) (sqlc.CateringDetail, error) {
	return r.q.CreateCateringDetails(ctx, arg)
}

func (r *Repository) GetCateringDetailsByOrderID(ctx context.Context, orderID [16]byte) (sqlc.CateringDetail, error) {
	return r.q.GetCateringDetailsByOrderID(ctx, pgUUID(orderID))
}

func (r *Repository) CheckDateAvailability(ctx context.Context, eventDate pgtype.Date) (int64, error) {
	return r.q.CheckDateAvailability(ctx, eventDate)
}

// --- Status history ---

func (r *Repository) CreateOrderStatusHistory(ctx context.Context, arg sqlc.CreateOrderStatusHistoryParams) (sqlc.OrderStatusHistory, error) {
	return r.q.CreateOrderStatusHistory(ctx, arg)
}

func (r *Repository) ListOrderStatusHistory(ctx context.Context, orderID [16]byte) ([]sqlc.OrderStatusHistory, error) {
	return r.q.ListOrderStatusHistory(ctx, pgUUID(orderID))
}
