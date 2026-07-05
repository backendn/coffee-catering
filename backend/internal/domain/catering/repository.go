package catering

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
)

// Repository wraps sqlc-generated queries for the catering domain.
type Repository struct {
	q *sqlc.Queries
}

func NewRepository(q *sqlc.Queries) *Repository {
	return &Repository{q: q}
}

func (r *Repository) ListActiveCateringPackages(ctx context.Context) ([]sqlc.CateringPackage, error) {
	return r.q.ListActiveCateringPackages(ctx)
}

func (r *Repository) GetCateringPackageByID(ctx context.Context, id pgtype.UUID) (sqlc.CateringPackage, error) {
	return r.q.GetCateringPackageByID(ctx, id)
}

func (r *Repository) CheckDateAvailability(ctx context.Context, eventDate pgtype.Date) (int64, error) {
	return r.q.CheckDateAvailability(ctx, eventDate)
}

func (r *Repository) CreateCateringPackage(ctx context.Context, arg sqlc.CreateCateringPackageParams) (sqlc.CateringPackage, error) {
	return r.q.CreateCateringPackage(ctx, arg)
}

func (r *Repository) UpdateCateringPackage(ctx context.Context, arg sqlc.UpdateCateringPackageParams) (sqlc.CateringPackage, error) {
	return r.q.UpdateCateringPackage(ctx, arg)
}

func (r *Repository) DeleteCateringPackage(ctx context.Context, id pgtype.UUID) error {
	return r.q.DeleteCateringPackage(ctx, id)
}

// ListUpcomingCateringBookings backs the admin calendar view.
func (r *Repository) ListUpcomingCateringBookings(ctx context.Context) ([]sqlc.ListUpcomingCateringBookingsRow, error) {
	return r.q.ListUpcomingCateringBookings(ctx)
}
