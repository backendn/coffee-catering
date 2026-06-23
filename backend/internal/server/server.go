package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/backendn/coffee-catering/backend/internal/config"
	"github.com/backendn/coffee-catering/backend/internal/domain/admin"
	"github.com/backendn/coffee-catering/backend/internal/domain/catering"
	"github.com/backendn/coffee-catering/backend/internal/domain/customer"
	"github.com/backendn/coffee-catering/backend/internal/domain/notification"
	"github.com/backendn/coffee-catering/backend/internal/domain/order"
	"github.com/backendn/coffee-catering/backend/internal/domain/product"
	"github.com/backendn/coffee-catering/backend/internal/server/middleware"
)

// Server wires together config, the DB pool, and the HTTP engine.
type Server struct {
	cfg    *config.Config
	db     *pgxpool.Pool
	engine *gin.Engine
	http   *http.Server

	orderHandler    *order.Handler
	productHandler  *product.Handler
	cateringHandler *catering.Handler
	adminHandler    *admin.Handler
	customerHandler *customer.Handler
}

// New creates a Server, connects to Postgres, constructs domain services,
// and registers routes.
func New(cfg *config.Config) (*Server, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DBUrl)
	if err != nil {
		return nil, fmt.Errorf("unable to create db pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()
	engine.Use(gin.Logger(), gin.Recovery())
	engine.Use(middleware.CORS(cfg.AllowedOrigins))

	// --- domain wiring ---
	// sqlc.New(pool) satisfies the DBTX interface directly with *pgxpool.Pool
	// for non-transactional calls; Repository.WithTx swaps in a tx-bound
	// Queries instance when a domain method needs a transaction.
	queries := sqlc.New(pool)
	notifier := notification.NewService(cfg.ResendAPIKey, cfg.ResendFrom)

	orderRepo := order.NewRepository(queries)
	orderService := order.NewService(pool, orderRepo, notifier)
	orderHandler := order.NewHandler(orderService)

	productRepo := product.NewRepository(queries)
	productService := product.NewService(productRepo)
	productHandler := product.NewHandler(productService)

	cateringRepo := catering.NewRepository(queries)
	cateringService := catering.NewService(cateringRepo)
	cateringHandler := catering.NewHandler(cateringService)

	adminRepo := admin.NewRepository(queries)
	adminService := admin.NewService(adminRepo, cfg.JWTSecret)
	adminHandler := admin.NewHandler(adminService)

	customerRepo := customer.NewRepository(queries)
	customerService := customer.NewService(customerRepo)
	customerHandler := customer.NewHandler(customerService)

	s := &Server{
		cfg:             cfg,
		db:              pool,
		engine:          engine,
		orderHandler:    orderHandler,
		productHandler:  productHandler,
		cateringHandler: cateringHandler,
		adminHandler:    adminHandler,
		customerHandler: customerHandler,
	}

	s.registerRoutes()

	s.http = &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: engine,
	}

	return s, nil
}

// Run starts the HTTP server. Blocks until the server stops or errors.
func (s *Server) Run() error {
	log.Printf("server listening on %s (env=%s)", s.http.Addr, s.cfg.Env)
	return s.http.ListenAndServe()
}

// Shutdown gracefully stops the HTTP server and closes the DB pool.
func (s *Server) Shutdown(ctx context.Context) error {
	s.db.Close()
	return s.http.Shutdown(ctx)
}