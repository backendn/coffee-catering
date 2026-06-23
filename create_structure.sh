#!/bin/bash
set -e

ROOT="coffee-catering"

# Top level
mkdir -p "$ROOT"
touch "$ROOT/docker-compose.yml"
touch "$ROOT/docker-compose.override.yml.example"
touch "$ROOT/Makefile"
touch "$ROOT/.env.example"
touch "$ROOT/.gitignore"
touch "$ROOT/README.md"

# migrations
mkdir -p "$ROOT/migrations"
touch "$ROOT/migrations/000001_init_schema.up.sql"
touch "$ROOT/migrations/000001_init_schema.down.sql"

# backend root
mkdir -p "$ROOT/backend"
touch "$ROOT/backend/Dockerfile"
touch "$ROOT/backend/Dockerfile.dev"
touch "$ROOT/backend/go.mod"
touch "$ROOT/backend/go.sum"
touch "$ROOT/backend/sqlc.yaml"
touch "$ROOT/backend/main.go"

# backend/db
mkdir -p "$ROOT/backend/db/query"
touch "$ROOT/backend/db/query/admin_users.sql"
touch "$ROOT/backend/db/query/customers.sql"
touch "$ROOT/backend/db/query/products.sql"
touch "$ROOT/backend/db/query/product_variants.sql"
touch "$ROOT/backend/db/query/orders.sql"
touch "$ROOT/backend/db/query/order_items.sql"
touch "$ROOT/backend/db/query/catering_packages.sql"
touch "$ROOT/backend/db/query/catering_details.sql"
touch "$ROOT/backend/db/query/order_status_history.sql"
mkdir -p "$ROOT/backend/db/sqlc"   # generated code goes here

# backend/internal/config
mkdir -p "$ROOT/backend/internal/config"
touch "$ROOT/backend/internal/config/config.go"

# backend/internal/server
mkdir -p "$ROOT/backend/internal/server/middleware"
touch "$ROOT/backend/internal/server/server.go"
touch "$ROOT/backend/internal/server/router.go"
touch "$ROOT/backend/internal/server/middleware/auth.go"
touch "$ROOT/backend/internal/server/middleware/cors.go"
touch "$ROOT/backend/internal/server/middleware/logger.go"

# backend/internal/domain/customer
mkdir -p "$ROOT/backend/internal/domain/customer"
touch "$ROOT/backend/internal/domain/customer/handler.go"
touch "$ROOT/backend/internal/domain/customer/service.go"
touch "$ROOT/backend/internal/domain/customer/repository.go"
touch "$ROOT/backend/internal/domain/customer/dto.go"

# backend/internal/domain/product
mkdir -p "$ROOT/backend/internal/domain/product"
touch "$ROOT/backend/internal/domain/product/handler.go"
touch "$ROOT/backend/internal/domain/product/service.go"
touch "$ROOT/backend/internal/domain/product/repository.go"
touch "$ROOT/backend/internal/domain/product/dto.go"

# backend/internal/domain/order
mkdir -p "$ROOT/backend/internal/domain/order"
touch "$ROOT/backend/internal/domain/order/handler.go"
touch "$ROOT/backend/internal/domain/order/service.go"
touch "$ROOT/backend/internal/domain/order/repository.go"
touch "$ROOT/backend/internal/domain/order/dto.go"

# backend/internal/domain/catering
mkdir -p "$ROOT/backend/internal/domain/catering"
touch "$ROOT/backend/internal/domain/catering/handler.go"
touch "$ROOT/backend/internal/domain/catering/service.go"
touch "$ROOT/backend/internal/domain/catering/repository.go"
touch "$ROOT/backend/internal/domain/catering/dto.go"

# backend/internal/domain/admin
mkdir -p "$ROOT/backend/internal/domain/admin"
touch "$ROOT/backend/internal/domain/admin/handler.go"
touch "$ROOT/backend/internal/domain/admin/service.go"
touch "$ROOT/backend/internal/domain/admin/dto.go"

# backend/internal/domain/notification
mkdir -p "$ROOT/backend/internal/domain/notification/templates"
touch "$ROOT/backend/internal/domain/notification/service.go"
touch "$ROOT/backend/internal/domain/notification/templates/order_confirmation.html"
touch "$ROOT/backend/internal/domain/notification/templates/status_update.html"

# backend/internal/pkg
mkdir -p "$ROOT/backend/internal/pkg/util"
mkdir -p "$ROOT/backend/internal/pkg/apperror"
mkdir -p "$ROOT/backend/internal/pkg/response"
touch "$ROOT/backend/internal/pkg/util/helpers.go"
touch "$ROOT/backend/internal/pkg/apperror/errors.go"
touch "$ROOT/backend/internal/pkg/response/response.go"

# backend/util (root-level, separate from internal/pkg/util)
mkdir -p "$ROOT/backend/util"
touch "$ROOT/backend/util/validator.go"

# frontend root
mkdir -p "$ROOT/frontend"
touch "$ROOT/frontend/Dockerfile"
touch "$ROOT/frontend/Dockerfile.dev"
touch "$ROOT/frontend/package.json"
touch "$ROOT/frontend/tsconfig.json"
touch "$ROOT/frontend/vite.config.ts"
touch "$ROOT/frontend/index.html"

# frontend/public
mkdir -p "$ROOT/frontend/public/icons"
touch "$ROOT/frontend/public/manifest.json"
touch "$ROOT/frontend/public/robots.txt"
touch "$ROOT/frontend/public/icons/icon-192.png"
touch "$ROOT/frontend/public/icons/icon-512.png"

# frontend/src root files
mkdir -p "$ROOT/frontend/src"
touch "$ROOT/frontend/src/main.tsx"
touch "$ROOT/frontend/src/App.tsx"
touch "$ROOT/frontend/src/service-worker.ts"

# frontend/src/api
mkdir -p "$ROOT/frontend/src/api"
touch "$ROOT/frontend/src/api/client.ts"
touch "$ROOT/frontend/src/api/products.ts"
touch "$ROOT/frontend/src/api/orders.ts"
touch "$ROOT/frontend/src/api/catering.ts"
touch "$ROOT/frontend/src/api/admin.ts"

# frontend/src/components
mkdir -p "$ROOT/frontend/src/components/layout"
mkdir -p "$ROOT/frontend/src/components/ui"
mkdir -p "$ROOT/frontend/src/components/cart"
touch "$ROOT/frontend/src/components/layout/PublicLayout.tsx"
touch "$ROOT/frontend/src/components/layout/AdminLayout.tsx"
touch "$ROOT/frontend/src/components/cart/CartProvider.tsx"
touch "$ROOT/frontend/src/components/cart/CartDrawer.tsx"

# frontend/src/pages/public
mkdir -p "$ROOT/frontend/src/pages/public"
touch "$ROOT/frontend/src/pages/public/Home.tsx"
touch "$ROOT/frontend/src/pages/public/Catalog.tsx"
touch "$ROOT/frontend/src/pages/public/ProductDetail.tsx"
touch "$ROOT/frontend/src/pages/public/Checkout.tsx"
touch "$ROOT/frontend/src/pages/public/Catering.tsx"
touch "$ROOT/frontend/src/pages/public/OrderConfirmation.tsx"

# frontend/src/pages/admin
mkdir -p "$ROOT/frontend/src/pages/admin"
touch "$ROOT/frontend/src/pages/admin/Login.tsx"
touch "$ROOT/frontend/src/pages/admin/Dashboard.tsx"
touch "$ROOT/frontend/src/pages/admin/Orders.tsx"
touch "$ROOT/frontend/src/pages/admin/OrderDetail.tsx"
touch "$ROOT/frontend/src/pages/admin/Products.tsx"
touch "$ROOT/frontend/src/pages/admin/CateringPackages.tsx"

# frontend/src/hooks
mkdir -p "$ROOT/frontend/src/hooks"
touch "$ROOT/frontend/src/hooks/useAuth.ts"

# frontend/src/types
mkdir -p "$ROOT/frontend/src/types"
touch "$ROOT/frontend/src/types/index.ts"

# frontend/src/styles
mkdir -p "$ROOT/frontend/src/styles"
touch "$ROOT/frontend/src/styles/globals.css"

echo "Project structure created under ./$ROOT"
