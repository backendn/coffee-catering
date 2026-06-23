package catering

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

// RegisterPublicRoutes mounts customer-facing catering endpoints.
func (h *Handler) RegisterPublicRoutes(rg *gin.RouterGroup) {
	rg.GET("/catering/packages", h.listPackages)
	rg.GET("/catering/availability", h.checkAvailability)
}

// RegisterAdminRoutes mounts staff-facing catering management.
// Caller is expected to apply auth middleware to this group.
func (h *Handler) RegisterAdminRoutes(rg *gin.RouterGroup) {
	rg.POST("/catering/packages", h.createPackage)
}

func (h *Handler) listPackages(c *gin.Context) {
	packages, err := h.service.ListPackages(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, packages)
}

// checkAvailability expects ?date=YYYY-MM-DD.
func (h *Handler) checkAvailability(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": "missing_date", "message": "date query param is required (YYYY-MM-DD)"})
		return
	}

	availability, err := h.service.CheckAvailability(c.Request.Context(), date)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, availability)
}

func (h *Handler) createPackage(c *gin.Context) {
	var req CreatePackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}

	pkg, err := h.service.CreatePackage(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusCreated, pkg)
}
