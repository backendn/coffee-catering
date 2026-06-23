package product

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
)

// Repository wraps sqlc-generated queries for the product domain.
type Repository struct {
	q *sqlc.Queries
}

func NewRepository(q *sqlc.Queries) *Repository {
	return &Repository{q: q}
}

// --- Public catalog ---

func (r *Repository) ListActiveProducts(ctx context.Context) ([]sqlc.Product, error) {
	return r.q.ListActiveProducts(ctx)
}

func (r *Repository) GetProductBySlug(ctx context.Context, slug string) (sqlc.Product, error) {
	return r.q.GetProductBySlug(ctx, slug)
}

func (r *Repository) ListVariantsByProductID(ctx context.Context, productID pgtype.UUID) ([]sqlc.ProductVariant, error) {
	return r.q.ListVariantsByProductID(ctx, productID)
}

// --- Admin ---

func (r *Repository) GetProductByID(ctx context.Context, id pgtype.UUID) (sqlc.Product, error) {
	return r.q.GetProductByID(ctx, id)
}

func (r *Repository) CreateProduct(ctx context.Context, arg sqlc.CreateProductParams) (sqlc.Product, error) {
	return r.q.CreateProduct(ctx, arg)
}

func (r *Repository) UpdateProduct(ctx context.Context, arg sqlc.UpdateProductParams) (sqlc.Product, error) {
	return r.q.UpdateProduct(ctx, arg)
}

func (r *Repository) DeleteProduct(ctx context.Context, id pgtype.UUID) error {
	return r.q.DeleteProduct(ctx, id)
}

func (r *Repository) CreateVariant(ctx context.Context, arg sqlc.CreateVariantParams) (sqlc.ProductVariant, error) {
	return r.q.CreateVariant(ctx, arg)
}

func (r *Repository) UpdateVariantStock(ctx context.Context, arg sqlc.UpdateVariantStockParams) (sqlc.ProductVariant, error) {
	return r.q.UpdateVariantStock(ctx, arg)
}

func (r *Repository) UpdateVariant(ctx context.Context, arg sqlc.UpdateVariantParams) (sqlc.ProductVariant, error) {
	return r.q.UpdateVariant(ctx, arg)
}

func (r *Repository) DeleteVariant(ctx context.Context, id pgtype.UUID) error {
	return r.q.DeleteVariant(ctx, id)
}