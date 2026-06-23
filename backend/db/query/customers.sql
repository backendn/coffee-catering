-- name: GetCustomerByPhone :one
SELECT * FROM customers WHERE phone = $1;

-- name: CreateCustomer :one
INSERT INTO customers (full_name, phone, email)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCustomerByID :one
SELECT * FROM customers WHERE id = $1;

-- name: ListCustomers :many
-- Admin customer list, newest first, optionally searched by name or phone.
SELECT * FROM customers
WHERE (sqlc.narg('search')::text IS NULL
       OR full_name ILIKE '%' || sqlc.narg('search') || '%'
       OR phone ILIKE '%' || sqlc.narg('search') || '%')
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountCustomerOrders :one
SELECT COUNT(*) FROM orders WHERE customer_id = $1;

-- Note: "get or create" isn't a single sqlc query; the service layer calls
-- GetCustomerByPhone first, then CreateCustomer if no row was found.