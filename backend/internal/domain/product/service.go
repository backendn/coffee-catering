package product

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

// ListCatalog returns every active product with its active variants nested
// inside — one call for the frontend to render the full storefront grid.
func (s *Service) ListCatalog(ctx context.Context) ([]ProductResponse, error) {
	products, err := s.repo.ListActiveProducts(ctx)
	if err != nil {
		return nil, fmt.Errorf("listing products: %w", err)
	}

	result := make([]ProductResponse, 0, len(products))
	for _, p := range products {
		variants, err := s.repo.ListVariantsByProductID(ctx, p.ID)
		if err != nil {
			return nil, fmt.Errorf("listing variants for product %s: %w", p.Slug, err)
		}
		result = append(result, toProductResponse(p, variants))
	}
	return result, nil
}

// GetBySlug returns a single product with its variants, for a product
// detail page. Returns a 404 apperror if the slug doesn't match an active
// product.
func (s *Service) GetBySlug(ctx context.Context, slug string) (*ProductResponse, error) {
	p, err := s.repo.GetProductBySlug(ctx, slug)
	if err != nil {
		return nil, apperror.NewNotFound("product_not_found", "product not found")
	}

	variants, err := s.repo.ListVariantsByProductID(ctx, p.ID)
	if err != nil {
		return nil, fmt.Errorf("listing variants: %w", err)
	}

	resp := toProductResponse(p, variants)
	return &resp, nil
}

// CreateProduct is an admin-only operation to add a new coffee product.
// Variants are added separately via CreateVariant.
func (s *Service) CreateProduct(ctx context.Context, req CreateProductRequest) (*ProductResponse, error) {
	p, err := s.repo.CreateProduct(ctx, sqlc.CreateProductParams{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
		ImageUrl:    pgtype.Text{String: req.ImageURL, Valid: req.ImageURL != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("creating product: %w", err)
	}
	resp := toProductResponse(p, nil)
	return &resp, nil
}

// UpdateProduct edits an existing product's name, slug, description, or image.
func (s *Service) UpdateProduct(ctx context.Context, idStr string, req UpdateProductRequest) (*ProductResponse, error) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_product_id", "product id must be a valid UUID")
	}

	p, err := s.repo.UpdateProduct(ctx, sqlc.UpdateProductParams{
		ID:          pgtype.UUID{Bytes: id, Valid: true},
		Name:        req.Name,
		Slug:        req.Slug,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
		ImageUrl:    pgtype.Text{String: req.ImageURL, Valid: req.ImageURL != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("updating product: %w", err)
	}

	variants, err := s.repo.ListVariantsByProductID(ctx, p.ID)
	if err != nil {
		return nil, fmt.Errorf("listing variants: %w", err)
	}
	resp := toProductResponse(p, variants)
	return &resp, nil
}

// DeleteProduct soft-deletes a product by setting is_active = false so
// existing orders that reference it aren't broken.
func (s *Service) DeleteProduct(ctx context.Context, idStr string) error {
	id, err := uuid.Parse(idStr)
	if err != nil {
		return apperror.NewBadRequest("invalid_product_id", "product id must be a valid UUID")
	}
	return s.repo.DeleteProduct(ctx, pgtype.UUID{Bytes: id, Valid: true})
}

// CreateVariant adds a purchasable SKU (grind/weight/price/stock) to an
// existing product.
func (s *Service) CreateVariant(ctx context.Context, productIDStr string, req CreateVariantRequest) (*VariantResponse, error) {
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_product_id", "product_id must be a valid UUID")
	}

	var price pgtype.Numeric
	if err := price.Scan(req.Price); err != nil {
		return nil, apperror.NewBadRequest("invalid_price", "price must be a valid decimal, e.g. \"350.00\"")
	}

	v, err := s.repo.CreateVariant(ctx, sqlc.CreateVariantParams{
		ProductID:     pgtype.UUID{Bytes: productID, Valid: true},
		Sku:           req.SKU,
		GrindType:     pgtype.Text{String: req.GrindType, Valid: req.GrindType != ""},
		WeightGrams:   req.WeightGrams,
		Price:         price,
		StockQuantity: req.StockQuantity,
	})
	if err != nil {
		return nil, fmt.Errorf("creating variant: %w", err)
	}

	resp := toVariantResponse(v)
	return &resp, nil
}

// UpdateStock is an admin operation for manual inventory correction.
func (s *Service) UpdateStock(ctx context.Context, variantIDStr string, req UpdateStockRequest) (*VariantResponse, error) {
	variantID, err := uuid.Parse(variantIDStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_variant_id", "variant_id must be a valid UUID")
	}
	v, err := s.repo.UpdateVariantStock(ctx, sqlc.UpdateVariantStockParams{
		ID:            pgtype.UUID{Bytes: variantID, Valid: true},
		StockQuantity: req.StockQuantity,
	})
	if err != nil {
		return nil, fmt.Errorf("updating stock: %w", err)
	}
	resp := toVariantResponse(v)
	return &resp, nil
}

// UpdateVariant edits a variant's SKU, grind type, weight, price, and stock.
func (s *Service) UpdateVariant(ctx context.Context, variantIDStr string, req UpdateVariantRequest) (*VariantResponse, error) {
	variantID, err := uuid.Parse(variantIDStr)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_variant_id", "variant_id must be a valid UUID")
	}

	var price pgtype.Numeric
	if err := price.Scan(req.Price); err != nil {
		return nil, apperror.NewBadRequest("invalid_price", "price must be a valid decimal, e.g. \"350.00\"")
	}

	v, err := s.repo.UpdateVariant(ctx, sqlc.UpdateVariantParams{
		ID:            pgtype.UUID{Bytes: variantID, Valid: true},
		Sku:           req.SKU,
		GrindType:     pgtype.Text{String: req.GrindType, Valid: req.GrindType != ""},
		WeightGrams:   req.WeightGrams,
		Price:         price,
		StockQuantity: req.StockQuantity,
	})
	if err != nil {
		return nil, fmt.Errorf("updating variant: %w", err)
	}
	resp := toVariantResponse(v)
	return &resp, nil
}

// DeleteVariant permanently removes a variant. Only safe if no existing
// orders reference it — check before calling in production.
func (s *Service) DeleteVariant(ctx context.Context, variantIDStr string) error {
	variantID, err := uuid.Parse(variantIDStr)
	if err != nil {
		return apperror.NewBadRequest("invalid_variant_id", "variant_id must be a valid UUID")
	}
	return s.repo.DeleteVariant(ctx, pgtype.UUID{Bytes: variantID, Valid: true})
}

// --- mapping helpers ---

func toProductResponse(p sqlc.Product, variants []sqlc.ProductVariant) ProductResponse {
	vr := make([]VariantResponse, 0, len(variants))
	for _, v := range variants {
		vr = append(vr, toVariantResponse(v))
	}
	return ProductResponse{
		ID:          uuid.UUID(p.ID.Bytes).String(),
		Name:        p.Name,
		Slug:        p.Slug,
		Description: p.Description.String,
		ImageURL:    p.ImageUrl.String,
		Variants:    vr,
	}
}

func toVariantResponse(v sqlc.ProductVariant) VariantResponse {
	price, _ := v.Price.Float64Value()
	return VariantResponse{
		ID:            uuid.UUID(v.ID.Bytes).String(),
		SKU:           v.Sku,
		GrindType:     v.GrindType.String,
		WeightGrams:   v.WeightGrams,
		Price:         fmt.Sprintf("%.2f", price.Float64),
		StockQuantity: v.StockQuantity,
		InStock:       v.StockQuantity > 0,
	}
}