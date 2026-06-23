package admin

import "github.com/golang-jwt/jwt/v5"

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  UserSummary `json:"user"`
}

type UserSummary struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name,omitempty"`
	Role     string `json:"role"`
}

// Claims is the JWT payload. Role is included so middleware can do
// role-based checks (e.g. only "admin" can create products) without an
// extra DB lookup per request.
type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
