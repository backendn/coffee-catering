package product

// ProductResponse is the public catalog shape: a product with its
// purchasable variants nested inside, so the frontend can render one
// product card with a weight/grind selector instead of separate calls.
type ProductResponse struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Slug        string            `json:"slug"`
	Description string            `json:"description,omitempty"`
	ImageURL    string            `json:"image_url,omitempty"`
	Variants    []VariantResponse `json:"variants"`
}

type VariantResponse struct {
	ID            string `json:"id"`
	SKU           string `json:"sku"`
	GrindType     string `json:"grind_type,omitempty"`
	WeightGrams   int32  `json:"weight_grams"`
	Price         string `json:"price"`
	StockQuantity int32  `json:"stock_quantity"`
	InStock       bool   `json:"in_stock"`
}

// --- Admin DTOs ---

type CreateProductRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Slug        string `json:"slug" binding:"required,min=2"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
}

type UpdateProductRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Slug        string `json:"slug" binding:"required,min=2"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
}

type CreateVariantRequest struct {
	SKU           string `json:"sku" binding:"required"`
	GrindType     string `json:"grind_type"`
	WeightGrams   int32  `json:"weight_grams" binding:"required,gt=0"`
	Price         string `json:"price" binding:"required"` // decimal string, e.g. "350.00"
	StockQuantity int32  `json:"stock_quantity" binding:"gte=0"`
}

type UpdateStockRequest struct {
	StockQuantity int32 `json:"stock_quantity" binding:"required,gte=0"`
}

type UpdateVariantRequest struct {
	SKU           string `json:"sku" binding:"required"`
	GrindType     string `json:"grind_type"`
	WeightGrams   int32  `json:"weight_grams" binding:"required,gt=0"`
	Price         string `json:"price" binding:"required"`
	StockQuantity int32  `json:"stock_quantity" binding:"gte=0"`
}