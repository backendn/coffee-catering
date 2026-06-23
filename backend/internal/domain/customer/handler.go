package customer

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/backendn/coffee-catering/backend/internal/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterAdminRoutes mounts staff-facing customer endpoints. There are no
// public customer routes — customers don't log in or browse their own
// profile in v1; order lookup is handled by order.Handler's
// GetByOrderNumber instead.
func (h *Handler) RegisterAdminRoutes(rg *gin.RouterGroup) {
	rg.GET("/customers", h.list)
	rg.GET("/customers/:id", h.getByID)
}

func (h *Handler) list(c *gin.Context) {
	var q ListCustomersQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_query", "message": err.Error()})
		return
	}

	customers, err := h.service.List(c.Request.Context(), q)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, customers)
}

func (h *Handler) getByID(c *gin.Context) {
	cust, err := h.service.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, cust)
}
