package catering

// PackageResponse is a public catering package listing.
type PackageResponse struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description,omitempty"`
	PricePerGuest string `json:"price_per_guest,omitempty"`
	FlatPrice     string `json:"flat_price,omitempty"`
	MinGuests     int32  `json:"min_guests,omitempty"`
	ImageURL      string `json:"image_url,omitempty"`
}

// AvailabilityResponse tells the frontend whether a date already has
// bookings, so the booking form can warn the customer without hard-blocking
// the date (you may still be able to take a second event that day).
type AvailabilityResponse struct {
	Date           string `json:"date"`
	ExistingBookings int  `json:"existing_bookings"`
	IsAvailable    bool   `json:"is_available"` // false only when bookings exist; advisory, not enforced
}

// --- Admin DTOs ---

type CreatePackageRequest struct {
	Name          string `json:"name" binding:"required,min=2"`
	Description   string `json:"description"`
	PricePerGuest string `json:"price_per_guest"`
	FlatPrice     string `json:"flat_price"`
	MinGuests     int32  `json:"min_guests"`
	ImageURL      string `json:"image_url"`
}

type UpdatePackageRequest struct {
	Name          string `json:"name" binding:"required,min=2"`
	Description   string `json:"description"`
	PricePerGuest string `json:"price_per_guest"`
	FlatPrice     string `json:"flat_price"`
	MinGuests     int32  `json:"min_guests"`
	ImageURL      string `json:"image_url"`
}