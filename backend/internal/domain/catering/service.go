package catering

import (
	"context"
	"fmt"
	"time"

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

// ListPackages returns active catering packages for the public booking page.
func (s *Service) ListPackages(ctx context.Context) ([]PackageResponse, error) {
	packages, err := s.repo.ListActiveCateringPackages(ctx)
	if err != nil {
		return nil, fmt.Errorf("listing catering packages: %w", err)
	}

	result := make([]PackageResponse, 0, len(packages))
	for _, p := range packages {
		result = append(result, toPackageResponse(p))
	}
	return result, nil
}

// CheckAvailability tells the frontend how many bookings already exist on a
// given date. This is advisory only (per v1 scope, double-booking isn't
// hard-blocked at the DB level) — staff make the final call manually.
func (s *Service) CheckAvailability(ctx context.Context, dateStr string) (*AvailabilityResponse, error) {
	parsed, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_date", "date must be in YYYY-MM-DD format")
	}

	count, err := s.repo.CheckDateAvailability(ctx, pgtype.Date{Time: parsed, Valid: true})
	if err != nil {
		return nil, fmt.Errorf("checking date availability: %w", err)
	}

	return &AvailabilityResponse{
		Date:             dateStr,
		ExistingBookings: int(count),
		IsAvailable:      count == 0,
	}, nil
}

// CreatePackage is an admin-only operation. At least one of PricePerGuest
// or FlatPrice should be set — not enforced here since pricing models may
// evolve; staff are trusted to fill this in sensibly for now.
func (s *Service) CreatePackage(ctx context.Context, req CreatePackageRequest) (*PackageResponse, error) {
	var pricePerGuest, flatPrice pgtype.Numeric

	if req.PricePerGuest != "" {
		if err := pricePerGuest.Scan(req.PricePerGuest); err != nil {
			return nil, apperror.NewBadRequest("invalid_price_per_guest", "price_per_guest must be a valid decimal")
		}
	}
	if req.FlatPrice != "" {
		if err := flatPrice.Scan(req.FlatPrice); err != nil {
			return nil, apperror.NewBadRequest("invalid_flat_price", "flat_price must be a valid decimal")
		}
	}

	p, err := s.repo.CreateCateringPackage(ctx, sqlc.CreateCateringPackageParams{
		Name:          req.Name,
		Description:   pgtype.Text{String: req.Description, Valid: req.Description != ""},
		PricePerGuest: pricePerGuest,
		FlatPrice:     flatPrice,
		MinGuests:     pgtype.Int4{Int32: req.MinGuests, Valid: req.MinGuests > 0},
	})
	if err != nil {
		return nil, fmt.Errorf("creating catering package: %w", err)
	}

	resp := toPackageResponse(p)
	return &resp, nil
}

func toPackageResponse(p sqlc.CateringPackage) PackageResponse {
	resp := PackageResponse{
		ID:   uuid.UUID(p.ID.Bytes).String(),
		Name: p.Name,
	}
	resp.Description = p.Description.String
	if p.PricePerGuest.Valid {
		v, _ := p.PricePerGuest.Float64Value()
		resp.PricePerGuest = fmt.Sprintf("%.2f", v.Float64)
	}
	if p.FlatPrice.Valid {
		v, _ := p.FlatPrice.Float64Value()
		resp.FlatPrice = fmt.Sprintf("%.2f", v.Float64)
	}
	if p.MinGuests.Valid {
		resp.MinGuests = p.MinGuests.Int32
	}
	return resp
}
