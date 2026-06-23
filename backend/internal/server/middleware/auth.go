package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/backendn/coffee-catering/backend/internal/domain/admin"
)

// ContextKey names used to stash claims on the Gin context for handlers
// that need to know who's calling (e.g. for order_status_history.changed_by).
const (
	ContextKeyUserID = "auth_user_id"
	ContextKeyRole   = "auth_role"
)

// RequireAdmin validates the Bearer JWT on every request in the group it's
// applied to. Invalid or missing tokens get a 401 before the request ever
// reaches a handler.
func RequireAdmin(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code": "missing_token", "message": "Authorization header with Bearer token is required",
			})
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims := &admin.Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code": "invalid_token", "message": "session expired or invalid, please log in again",
			})
			return
		}

		c.Set(ContextKeyUserID, claims.UserID)
		c.Set(ContextKeyRole, claims.Role)
		c.Next()
	}
}

// RequireRole further restricts a route to a specific role (e.g. "admin"
// only, excluding "staff"). Apply after RequireAdmin.
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		actual, _ := c.Get(ContextKeyRole)
		if actual != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"code": "forbidden", "message": "you don't have permission to perform this action",
			})
			return
		}
		c.Next()
	}
}
