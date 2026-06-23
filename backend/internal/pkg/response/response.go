package response

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/backendn/coffee-catering/backend/internal/pkg/apperror"
)

// Success writes a standard {"data": ...} envelope.
func Success(c *gin.Context, status int, data interface{}) {
	c.JSON(status, gin.H{"data": data})
}

// Error inspects the error type and writes the appropriate status + body.
// Unknown error types are treated as 500s with a generic message so internal
// details (e.g. raw DB errors) never reach the client.
func Error(c *gin.Context, err error) {
	if appErr, ok := err.(*apperror.AppError); ok {
		c.JSON(appErr.Status, gin.H{"code": appErr.Code, "message": appErr.Message})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{
		"code":    "internal_error",
		"message": "something went wrong, please try again",
	})
}