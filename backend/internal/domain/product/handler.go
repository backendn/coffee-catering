package product

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

// RegisterPublicRoutes mounts customer-facing catalog endpoints.
func (h *Handler) RegisterPublicRoutes(rg *gin.RouterGroup) {
	rg.GET("/products", h.list)
	rg.GET("/products/:slug", h.getBySlug)
}

// RegisterAdminRoutes mounts staff-facing product/variant management.
func (h *Handler) RegisterAdminRoutes(rg *gin.RouterGroup) {
	rg.POST("/products", h.create)
	rg.PUT("/products/:id", h.update)
	rg.DELETE("/products/:id", h.delete)
	rg.POST("/products/:id/variants", h.createVariant)
	rg.PUT("/variants/:id", h.updateVariant)
	rg.DELETE("/variants/:id", h.deleteVariant)
	rg.PATCH("/variants/:id/stock", h.updateStock)
}

func (h *Handler) list(c *gin.Context) {
	products, err := h.service.ListCatalog(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, products)
}

func (h *Handler) getBySlug(c *gin.Context) {
	product, err := h.service.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, product)
}

func (h *Handler) create(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}
	product, err := h.service.CreateProduct(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusCreated, product)
}

func (h *Handler) update(c *gin.Context) {
	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}
	product, err := h.service.UpdateProduct(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, product)
}

func (h *Handler) delete(c *gin.Context) {
	if err := h.service.DeleteProduct(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, err)
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

func (h *Handler) createVariant(c *gin.Context) {
	var req CreateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}

	variant, err := h.service.CreateVariant(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusCreated, variant)
}

func (h *Handler) updateStock(c *gin.Context) {
	var req UpdateStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}
	variant, err := h.service.UpdateStock(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, variant)
}

func (h *Handler) updateVariant(c *gin.Context) {
	var req UpdateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": "invalid_request", "message": err.Error()})
		return
	}
	variant, err := h.service.UpdateVariant(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		response.Error(c, err)
		return
	}
	response.Success(c, http.StatusOK, variant)
}

func (h *Handler) deleteVariant(c *gin.Context) {
	if err := h.service.DeleteVariant(c.Request.Context(), c.Param("id")); err != nil {
		response.Error(c, err)
		return
	}
	c.JSON(http.StatusNoContent, nil)
}