-- name: ListActiveProducts :many
SELECT * FROM products
WHERE is_active = true
ORDER BY name ASC;

-- name: GetProductBySlug :one
SELECT * FROM products WHERE slug = $1 AND is_active = true;

-- name: GetProductByID :one
SELECT * FROM products WHERE id = $1;

-- name: CreateProduct :one
INSERT INTO products (name, slug, description, image_url)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateProduct :one
UPDATE products
SET name = $2, slug = $3, description = $4, image_url = $5
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :exec
UPDATE products SET is_active = false WHERE id = $1;