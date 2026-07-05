package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/backendn/coffee-catering/backend/internal/server/middleware"
)

// registerRoutes wires up all route groups. Domain handlers (product,
// catering, admin) will be added here as they're built.
func (s *Server) registerRoutes() {
	s.engine.GET("/health", s.handleHealth)

	api := s.engine.Group("/api/v1")
	{
		s.orderHandler.RegisterPublicRoutes(api)
		s.productHandler.RegisterPublicRoutes(api)
		s.cateringHandler.RegisterPublicRoutes(api)
		s.adminHandler.RegisterPublicRoutes(api)
		// POST /admin/login — unprotected on purpose

		admin := api.Group("/admin")
		admin.Use(middleware.RequireAdmin(s.cfg.JWTSecret))
		{
			s.orderHandler.RegisterAdminRoutes(admin)
			s.productHandler.RegisterAdminRoutes(admin)
			s.cateringHandler.RegisterAdminRoutes(admin)
			s.customerHandler.RegisterAdminRoutes(admin)

		}
	}
}

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"env":    s.cfg.Env,
	})
}
