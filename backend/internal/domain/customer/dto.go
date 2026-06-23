package customer

import "time"

// CustomerResponse is the admin-facing customer record, with an order
// count attached so staff can spot repeat customers at a glance.
type CustomerResponse struct {
	ID         string    `json:"id"`
	FullName   string    `json:"full_name"`
	Phone      string    `json:"phone"`
	Email      string    `json:"email,omitempty"`
	OrderCount int64     `json:"order_count"`
	CreatedAt  time.Time `json:"created_at"`
}

// ListCustomersQuery covers admin search/pagination.
type ListCustomersQuery struct {
	Search string `form:"search"`
	Limit  int32  `form:"limit,default=20"`
	Offset int32  `form:"offset,default=0"`
}