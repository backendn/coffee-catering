package customer

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/backendn/coffee-catering/backend/internal/pkg/apperror"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// List returns customers for the admin view, optionally filtered by a
// search term matched against name or phone, with each customer's total
// order count attached.
func (s *Service) List(ctx context.Context, q ListCustomersQuery) ([]CustomerResponse, error) {
	var search pgtype.Text
	if q.Search != "" {
		search = pgtype.Text{String: q.Search, Valid: true}
	}

	customers, err := s.repo.ListCustomers(ctx, sqlc.ListCustomersParams{
		Search: search,
		Limit:  q.Limit,
		Offset: q.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("listing customers: %w", err)
	}

	result := make([]CustomerResponse, 0, len(customers))
	for _, c := range customers {
		count, err := s.repo.CountCustomerOrders(ctx, c.ID)
		if err != nil {
			return nil, fmt.Errorf("counting orders for customer %s: %w", c.Phone, err)
		}
		result = append(result, toResponse(c, count))
	}
	return result, nil
}

// GetByID returns a single customer with their order count, for an admin
// customer-detail view.
func (s *Service) GetByID(ctx context.Context, idStr string) (*CustomerResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_customer_id", "customer id must be a valid UUID")
	}

	c, err := s.repo.GetCustomerByID(ctx, pgtype.UUID{Bytes: id, Valid: true})
	if err != nil {
		return nil, apperror.NewNotFound("customer_not_found", "customer not found")
	}

	count, err := s.repo.CountCustomerOrders(ctx, c.ID)
	if err != nil {
		return nil, fmt.Errorf("counting orders: %w", err)
	}

	resp := toResponse(c, count)
	return &resp, nil
}

func toResponse(c sqlc.Customer, orderCount int64) CustomerResponse {
	return CustomerResponse{
		ID:         uuid.UUID(c.ID.Bytes).String(),
		FullName:   c.FullName,
		Phone:      c.Phone,
		Email:      c.Email.String,
		OrderCount: orderCount,
		CreatedAt:  c.CreatedAt.Time,
	}
}
