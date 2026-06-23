-- name: CreateOrderStatusHistory :one
INSERT INTO order_status_history (order_id, status, changed_by, note)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListOrderStatusHistory :many
SELECT * FROM order_status_history
WHERE order_id = $1
ORDER BY created_at ASC;