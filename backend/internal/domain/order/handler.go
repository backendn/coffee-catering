package order

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

// RegisterPublicRoutes mounts customer-facing order endpoints.
func (h *Handler) RegisterPublicRoutes(rg *gin.RouterGroup) {
	rg.POST("/orders", h.create)
	rg.GET("/orders/:orderNumber", h.getByOrderNumber)
}

// RegisterAdminRoutes mounts staff-facing order management endpoints.
// Caller is expected to apply auth middleware to this group.
func (h *Handler) RegisterAdminRoutes(rg *gin.RouterGroup) {
	rg.GET("/orders", h.list)
	rg.PATCH("/orders/:id/status", h.updateStatus)
}

// create handles both product and catering order intake. No payment is
// processed here — orders land as "pending" for manual follow-up, per v1 scope.
func (h *Handler) create(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}

	order, err := h.service.CreateOrder(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusCreated, order)
}

// getByOrderNumber lets a customer check their order status using the
// reference number from their confirmation email/SMS — no login required.
func (h *Handler) getByOrderNumber(c *gin.Context) {
	order, err := h.service.GetByOrderNumber(c.Request.Context(), c.Param("orderNumber"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, order)
}

// list is the admin order queue, filterable by status, paginated.
func (h *Handler) list(c *gin.Context) {
	var q ListOrdersQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_query", "message": err.Error()})
		return
	}

	orders, err := h.service.ListOrders(c.Request.Context(), q)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, orders)
}

// updateStatus moves an order through pending -> confirmed -> ... -> completed,
// recording the change in order_status_history.
func (h *Handler) updateStatus(c *gin.Context) {
	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}

	changedBy, _ := c.Get("auth_user_id") // set by middleware.RequireAdmin; empty if not present
	changedByStr, _ := changedBy.(string)

	order, err := h.service.UpdateStatus(c.Request.Context(), c.Param("id"), req, changedByStr)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, order)
}
