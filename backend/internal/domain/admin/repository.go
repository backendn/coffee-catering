package admin

import (
	"context"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
)

type Repository struct {
	q *sqlc.Queries
}

func NewRepository(q *sqlc.Queries) *Repository {
	return &Repository{q: q}
}

func (r *Repository) GetAdminUserByUsername(ctx context.Context, username string) (sqlc.AdminUser, error) {
	return r.q.GetAdminUserByUsername(ctx, username)
}

func (r *Repository) CreateAdminUser(ctx context.Context, arg sqlc.CreateAdminUserParams) (sqlc.AdminUser, error) {
	return r.q.CreateAdminUser(ctx, arg)
}
