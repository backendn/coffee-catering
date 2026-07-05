-- name: ListActiveCateringPackages :many
SELECT * FROM catering_packages
WHERE is_active = true
ORDER BY name ASC;

-- name: GetCateringPackageByID :one
SELECT * FROM catering_packages WHERE id = $1;

-- name: CreateCateringPackage :one
INSERT INTO catering_packages (name, description, price_per_guest, flat_price, min_guests, image_url)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateCateringPackage :one
UPDATE catering_packages
SET name = $2, description = $3, price_per_guest = $4, flat_price = $5, min_guests = $6, image_url = $7
WHERE id = $1
RETURNING *;

-- name: DeleteCateringPackage :exec
UPDATE catering_packages SET is_active = false WHERE id = $1;

-- name: CheckDateAvailability :one
-- Returns count of existing (non-cancelled) catering bookings on a given date,
-- so the service layer can flag the date as busy without hard-blocking it.
SELECT COUNT(*) FROM catering_details cd
JOIN orders o ON o.id = cd.order_id
WHERE cd.event_date = $1 AND o.status != 'cancelled';