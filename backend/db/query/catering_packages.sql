-- name: ListActiveCateringPackages :many
SELECT * FROM catering_packages
WHERE is_active = true
ORDER BY name ASC;

-- name: GetCateringPackageByID :one
SELECT * FROM catering_packages WHERE id = $1;

-- name: CreateCateringPackage :one
INSERT INTO catering_packages (name, description, price_per_guest, flat_price, min_guests)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: CheckDateAvailability :one
-- Returns count of existing (non-cancelled) catering bookings on a given date,
-- so the service layer can flag the date as busy without hard-blocking it.
SELECT COUNT(*) FROM catering_details cd
JOIN orders o ON o.id = cd.order_id
WHERE cd.event_date = $1 AND o.status != 'cancelled';