-- name: CreateOrderItem :one
INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price, line_total)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListOrderItemsByOrderID :many
SELECT oi.*, pv.sku, pv.grind_type, pv.weight_grams, p.name AS product_name
FROM order_items oi
JOIN product_variants pv ON pv.id = oi.product_variant_id
JOIN products p ON p.id = pv.product_id
WHERE oi.order_id = $1;