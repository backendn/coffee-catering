package customer

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
)

// Repository wraps sqlc-generated queries for the customer domain.
//
// Note: GetCustomerByPhone/CreateCustomer also exist on order.Repository,
// used inline by order.Service.getOrCreateCustomer during order creation.
// That duplication is intentional — it keeps the order domain's
// transaction (ExecTx) self-contained without a cross-domain repository
// dependency. This repository serves the customer domain's own use cases
// (admin listing/lookup) instead.
type Repository struct {
	q *sqlc.Queries
}

func NewRepository(q *sqlc.Queries) *Repository {
	return &Repository{q: q}
}

func (r *Repository) GetCustomerByID(ctx context.Context, id pgtype.UUID) (sqlc.Customer, error) {
	return r.q.GetCustomerByID(ctx, id)
}

func (r *Repository) ListCustomers(ctx context.Context, arg sqlc.ListCustomersParams) ([]sqlc.Customer, error) {
	return r.q.ListCustomers(ctx, arg)
}

func (r *Repository) CountCustomerOrders(ctx context.Context, customerID pgtype.UUID) (int64, error) {
	return r.q.CountCustomerOrders(ctx, customerID)
}
