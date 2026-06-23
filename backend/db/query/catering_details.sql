-- name: CreateCateringDetails :one
INSERT INTO catering_details (
    order_id, catering_package_id, event_date, event_time,
    guest_count, venue_address, custom_request
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetCateringDetailsByOrderID :one
SELECT * FROM catering_details WHERE order_id = $1;

-- name: ListUpcomingCateringBookings :many
-- For the admin calendar view.
SELECT cd.*, o.order_number, o.status, c.full_name, c.phone
FROM catering_details cd
JOIN orders o ON o.id = cd.order_id
JOIN customers c ON c.id = o.customer_id
WHERE cd.event_date >= CURRENT_DATE AND o.status != 'cancelled'
ORDER BY cd.event_date ASC;