.PHONY: up down logs migrate-up migrate-down sqlc-generate backend-shell db-shell

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f backend frontend

migrate-up:
	docker compose run --rm migrate -path /migrations -database "postgres://$${DB_USER}:$${DB_PASSWORD}@postgres:5432/$${DB_NAME}?sslmode=disable" up

migrate-up1:
	docker compose run --rm migrate -path /migrations -database "postgres://coffee_admin:changeme@postgres:5432/coffee_catering?sslmode=disable" up 1

migrate-down:
	docker compose run --rm migrate -path /migrations -database "postgres://$${DB_USER}:$${DB_PASSWORD}@postgres:5432/$${DB_NAME}?sslmode=disable" down 1

sqlc-generate:
	cd backend && sqlc generate

backend-shell:
	docker compose exec backend sh

db-shell:
	docker compose exec postgres psql -U $${DB_USER:-coffee_admin} -d $${DB_NAME:-coffee_catering}

seed:
	docker compose exec backend go run ./cmd/seed -username $${ADMIN_USER:-admin} -password $${ADMIN_PASS:-secret123} -name "$${ADMIN_NAME:-Admin}"