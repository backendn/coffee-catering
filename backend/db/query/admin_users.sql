-- name: GetAdminUserByUsername :one
SELECT * FROM admin_users WHERE username = $1 AND is_active = true;

-- name: GetAdminUserByID :one
SELECT * FROM admin_users WHERE id = $1;

-- name: CreateAdminUser :one
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;