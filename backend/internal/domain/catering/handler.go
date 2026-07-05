package catering

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/backendn/coffee-catering/backend/internal/pkg/response"
	"github.com/backendn/coffee-catering/backend/internal/pkg/upload"
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
	rg.PUT("/catering/packages/:id", h.updatePackage)
	rg.DELETE("/catering/packages/:id", h.deletePackage)
	rg.POST("/catering/packages/upload-image", h.uploadPackageImage)
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

func (h *Handler) updatePackage(c *gin.Context) {
	var req UpdatePackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}
	pkg, err := h.service.UpdatePackage(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, pkg)
}

func (h *Handler) deletePackage(c *gin.Context) {
	if err := h.service.DeletePackage(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, err)
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *Handler) uploadPackageImage(c *gin.Context) {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "missing_file", "message": "image file is required"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": "file_open_failed", "message": err.Error()})
		return
	}
	defer file.Close()

	url, err := upload.UploadImage(c.Request.Context(), file, "coffee-catering/packages")
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"url": url})
}


