-- name: NextOrderNumber :one
SELECT nextval('order_number_seq')::bigint;

-- name: CreateOrder :one
INSERT INTO orders (
    order_number, order_type, customer_id, delivery_method,
    delivery_address, contact_phone, payment_method, subtotal, customer_notes
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- name: GetOrderByID :one
SELECT * FROM orders WHERE id = $1;

-- name: GetOrderByOrderNumber :one
SELECT * FROM orders WHERE order_number = $1;

-- name: ListOrders :many
-- Admin order queue, newest first, optionally filtered by status.
SELECT * FROM orders
WHERE (sqlc.narg('status')::varchar IS NULL OR status = sqlc.narg('status'))
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = $2, admin_notes = COALESCE($3, admin_notes)
WHERE id = $1
RETURNING *;