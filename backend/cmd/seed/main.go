// Command seed creates the first admin user so you have credentials to log
// into the admin dashboard with. Run it once after migrations are applied:
//
//	go run ./cmd/seed -username admin -password "a-strong-password" -name "Semahegn"
//
// Inside Docker:
//
//	docker compose exec backend go run ./cmd/seed -username admin -password "a-strong-password"
//
// Safe to leave in the repo — it requires direct DB access (same DB_URL as
// the main app) and isn't exposed over HTTP, so it can't be triggered remotely.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/backendn/coffee-catering/backend/internal/config"
	"github.com/backendn/coffee-catering/backend/internal/domain/admin"
)

func main() {
	username := flag.String("username", "", "admin username (required)")
	password := flag.String("password", "", "admin password (required, min 8 chars)")
	fullName := flag.String("name", "", "admin full name (optional)")
	role := flag.String("role", "admin", "role: admin or staff")
	flag.Parse()

	if *username == "" || *password == "" {
		log.Fatal("both -username and -password are required")
	}
	if len(*password) < 8 {
		log.Fatal("password must be at least 8 characters")
	}
	if *role != "admin" && *role != "staff" {
		log.Fatal("role must be 'admin' or 'staff'")
	}

	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DBUrl)
	if err != nil {
		log.Fatalf("connecting to db: %v", err)
	}
	defer pool.Close()

	queries := sqlc.New(pool)
	repo := admin.NewRepository(queries)
	service := admin.NewService(repo, cfg.JWTSecret)

	user, err := service.CreateAdminUser(ctx, *username, *password, *fullName, *role)
	if err != nil {
		log.Fatalf("creating admin user: %v", err)
	}

	fmt.Printf("✓ admin user created: %s (id=%s, role=%s)\n", user.Username, user.ID, user.Role)
	fmt.Println("you can now log in via POST /api/v1/admin/login")
}
