-- name: ListVariantsByProductID :many
SELECT * FROM product_variants
WHERE product_id = $1 AND is_active = true
ORDER BY weight_grams ASC;

-- name: GetVariantByID :one
SELECT * FROM product_variants WHERE id = $1;

-- name: GetVariantForUpdate :one
-- Locks the row so concurrent orders can't both pass a stock check on the
-- same variant; used inside the order-creation transaction.
SELECT * FROM product_variants WHERE id = $1 FOR UPDATE;

-- name: DecrementVariantStock :exec
UPDATE product_variants
SET stock_quantity = stock_quantity - $2
WHERE id = $1 AND stock_quantity >= $2;

-- name: CreateVariant :one
INSERT INTO product_variants (product_id, sku, grind_type, weight_grams, price, stock_quantity)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateVariantStock :one
UPDATE product_variants
SET stock_quantity = $2
WHERE id = $1
RETURNING *;

-- name: UpdateVariant :one
UPDATE product_variants
SET sku = $2, grind_type = $3, weight_grams = $4, price = $5, stock_quantity = $6
WHERE id = $1
RETURNING *;

-- name: DeleteVariant :exec
DELETE FROM product_variants WHERE id = $1;