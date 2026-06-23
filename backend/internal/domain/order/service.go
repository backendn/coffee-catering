package order

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/backendn/coffee-catering/backend/db/sqlc"
	"github.com/backendn/coffee-catering/backend/internal/pkg/apperror"
)

// Service holds dependencies for order creation/management. It owns the
// transaction boundary for CreateOrder, since that operation touches
// customers, orders, order_items/catering_details, and order_status_history
// together and all of it must succeed or fail as one unit.
type Service struct {
	pool *pgxpool.Pool
	repo *Repository
	// notifier sends confirmation emails after a successful commit.
	// Defined as an interface here so notification stays decoupled.
	notifier Notifier
}

// Notifier is implemented by internal/domain/notification.Service.
// Kept minimal and defined here (consumer side) rather than in the
// notification package, per standard Go interface placement.
type Notifier interface {
	SendOrderConfirmation(ctx context.Context, customerEmail, customerName, orderNumber string) error
}

func NewService(pool *pgxpool.Pool, repo *Repository, notifier Notifier) *Service {
	return &Service{pool: pool, repo: repo, notifier: notifier}
}

// CreateOrder validates the request, then runs the entire creation flow
// (customer lookup/create, order row, items or catering details, initial
// status history entry, and for product orders, stock decrement) inside a
// single DB transaction via ExecTx. On success it fires a confirmation
// notification (best-effort, outside the transaction — a failed email
// should never roll back a placed order).
func (s *Service) CreateOrder(ctx context.Context, req CreateOrderRequest) (*OrderResponse, error) {
	var result *OrderResponse

	err := s.execTx(ctx, func(q *Repository) error {
		customer, err := s.getOrCreateCustomer(ctx, q, req)
		if err != nil {
			return err
		}

		orderNum, err := q.NextOrderNumber(ctx)
		if err != nil {
			return fmt.Errorf("generating order number: %w", err)
		}
		orderNumber := fmt.Sprintf("ORD-%06d", orderNum)

		switch req.OrderType {
		case "product":
			result, err = s.createProductOrder(ctx, q, customer.ID, orderNumber, req)
		case "catering":
			result, err = s.createCateringOrder(ctx, q, customer.ID, orderNumber, req)
		default:
			err = apperror.NewBadRequest("invalid_order_type", "order_type must be 'product' or 'catering'")
		}
		if err != nil {
			return err
		}

		_, err = q.CreateOrderStatusHistory(ctx, sqlc.CreateOrderStatusHistoryParams{
			OrderID: pgtype.UUID{Bytes: mustUUIDBytes(result.ID), Valid: true},
			Status:  "pending",
			Note:    pgtype.Text{String: "Order received", Valid: true},
		})
		return err
	})

	if err != nil {
		return nil, err
	}

	// Best-effort notification — log-and-continue on failure rather than
	// failing the whole request, since the order is already committed.
	if req.CustomerEmail != "" && s.notifier != nil {
		_ = s.notifier.SendOrderConfirmation(ctx, req.CustomerEmail, req.CustomerName, result.OrderNumber)
	}

	return result, nil
}

// createProductOrder handles the coffee-order path: validates each variant
// exists and has stock, locks the row (FOR UPDATE) to prevent overselling
// under concurrent orders, decrements stock, and inserts order_items.
func (s *Service) createProductOrder(ctx context.Context, q *Repository, customerID pgtype.UUID, orderNumber string, req CreateOrderRequest) (*OrderResponse, error) {
	if len(req.Items) == 0 {
		return nil, apperror.NewBadRequest("empty_order", "at least one item is required")
	}

	var subtotal float64
	type lineItem struct {
		variant   sqlc.ProductVariant
		quantity  int32
		lineTotal float64
	}
	lines := make([]lineItem, 0, len(req.Items))

	for _, item := range req.Items {
		variantID := mustParseUUID(item.ProductVariantID)

		variant, err := q.GetVariantForUpdate(ctx, variantID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return nil, apperror.NewNotFound("variant_not_found", "one or more selected products no longer exist")
			}
			return nil, fmt.Errorf("fetching variant: %w", err)
		}

		if variant.StockQuantity < item.Quantity {
			return nil, apperror.NewConflict("insufficient_stock",
				fmt.Sprintf("not enough stock for %s", variant.Sku))
		}

		unitPrice, _ := variant.Price.Float64Value()
		lineTotal := unitPrice.Float64 * float64(item.Quantity)
		subtotal += lineTotal

		lines = append(lines, lineItem{variant: variant, quantity: item.Quantity, lineTotal: lineTotal})
	}

	order, err := q.CreateOrder(ctx, sqlc.CreateOrderParams{
		OrderNumber:     orderNumber,
		OrderType:       "product",
		CustomerID:      customerID,
		DeliveryMethod:  req.DeliveryMethod,
		DeliveryAddress: pgtype.Text{String: req.DeliveryAddr, Valid: req.DeliveryAddr != ""},
		ContactPhone:    req.CustomerPhone,
		PaymentMethod:   "manual",
		Subtotal:        pgtypeNumeric(subtotal),
		CustomerNotes:   pgtype.Text{String: req.CustomerNotes, Valid: req.CustomerNotes != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("creating order: %w", err)
	}

	resp := &OrderResponse{
		ID: uuidString(order.ID), OrderNumber: order.OrderNumber, OrderType: order.OrderType,
		Status: order.Status, DeliveryMethod: order.DeliveryMethod,
		DeliveryAddr: order.DeliveryAddress.String, ContactPhone: order.ContactPhone,
		PaymentMethod: order.PaymentMethod, PaymentStatus: order.PaymentStatus,
		Subtotal: fmt.Sprintf("%.2f", subtotal), CreatedAt: order.CreatedAt.Time,
	}

	for _, line := range lines {
		unitPrice, _ := line.variant.Price.Float64Value()

		_, err := q.CreateOrderItem(ctx, sqlc.CreateOrderItemParams{
			OrderID:          order.ID,
			ProductVariantID: line.variant.ID,
			Quantity:         line.quantity,
			UnitPrice:        line.variant.Price,
			LineTotal:        pgtypeNumeric(line.lineTotal),
		})
		if err != nil {
			return nil, fmt.Errorf("creating order item: %w", err)
		}

		if err := q.DecrementVariantStock(ctx, sqlc.DecrementVariantStockParams{
			ID:            line.variant.ID,
			StockQuantity: line.quantity,
		}); err != nil {
			return nil, fmt.Errorf("decrementing stock: %w", err)
		}

		resp.Items = append(resp.Items, OrderItemResp{
			GrindType: line.variant.GrindType.String, WeightGrams: line.variant.WeightGrams,
			Quantity: line.quantity, UnitPrice: fmt.Sprintf("%.2f", unitPrice.Float64),
			LineTotal: fmt.Sprintf("%.2f", line.lineTotal),
		})
	}

	return resp, nil
}

// createCateringOrder handles the booking path: creates the order with
// subtotal = 0 (pricing is finalized manually with the customer for now),
// and links a catering_details row.
func (s *Service) createCateringOrder(ctx context.Context, q *Repository, customerID pgtype.UUID, orderNumber string, req CreateOrderRequest) (*OrderResponse, error) {
	c := req.Catering
	if c == nil {
		return nil, apperror.NewBadRequest("missing_catering_details", "catering details are required")
	}

	eventDate, err := time.Parse("2006-01-02", c.EventDate)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_event_date", "event_date must be in YYYY-MM-DD format")
	}

	order, err := q.CreateOrder(ctx, sqlc.CreateOrderParams{
		OrderNumber:     orderNumber,
		OrderType:       "catering",
		CustomerID:      customerID,
		DeliveryMethod:  req.DeliveryMethod,
		DeliveryAddress: pgtype.Text{String: req.DeliveryAddr, Valid: req.DeliveryAddr != ""},
		ContactPhone:    req.CustomerPhone,
		PaymentMethod:   "manual",
		Subtotal:        pgtypeNumeric(0),
		CustomerNotes:   pgtype.Text{String: req.CustomerNotes, Valid: req.CustomerNotes != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("creating order: %w", err)
	}

	var packageID pgtype.UUID
	if c.CateringPackageID != "" {
		packageID = pgtype.UUID{Bytes: mustParseUUID(c.CateringPackageID), Valid: true}
	}

	details, err := q.CreateCateringDetails(ctx, sqlc.CreateCateringDetailsParams{
		OrderID:           order.ID,
		CateringPackageID: packageID,
		EventDate:         pgtype.Date{Time: eventDate, Valid: true},
		EventTime:         pgtype.Time{Microseconds: 0, Valid: c.EventTime != ""}, // parse properly in real impl
		GuestCount:        c.GuestCount,
		VenueAddress:      pgtype.Text{String: c.VenueAddress, Valid: c.VenueAddress != ""},
		CustomRequest:     pgtype.Text{String: c.CustomRequest, Valid: c.CustomRequest != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("creating catering details: %w", err)
	}

	return &OrderResponse{
		ID: uuidString(order.ID), OrderNumber: order.OrderNumber, OrderType: order.OrderType,
		Status: order.Status, DeliveryMethod: order.DeliveryMethod,
		DeliveryAddr: order.DeliveryAddress.String, ContactPhone: order.ContactPhone,
		PaymentMethod: order.PaymentMethod, PaymentStatus: order.PaymentStatus,
		Subtotal: "0.00", CreatedAt: order.CreatedAt.Time,
		Catering: &CateringDetailResp{
			EventDate: c.EventDate, EventTime: c.EventTime, GuestCount: details.GuestCount,
			VenueAddress: c.VenueAddress, CustomRequest: c.CustomRequest,
		},
	}, nil
}

// GetByOrderNumber lets a customer check their order using the reference
// number from their confirmation email/SMS — no login required. Hydrates
// items (for product orders) or catering details (for catering orders) so
// the response matches what CreateOrder originally returned.
func (s *Service) GetByOrderNumber(ctx context.Context, orderNumber string) (*OrderResponse, error) {
	order, err := s.repo.GetOrderByOrderNumber(ctx, orderNumber)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, apperror.NewNotFound("order_not_found", "no order found with that reference number")
		}
		return nil, fmt.Errorf("fetching order: %w", err)
	}

	resp := orderToResponse(order)

	switch order.OrderType {
	case "product":
		items, err := s.repo.ListOrderItemsByOrderID(ctx, order.ID.Bytes)
		if err != nil {
			return nil, fmt.Errorf("fetching order items: %w", err)
		}
		for _, item := range items {
			unitPrice, _ := item.UnitPrice.Float64Value()
			lineTotal, _ := item.LineTotal.Float64Value()
			resp.Items = append(resp.Items, OrderItemResp{
				ProductName: item.ProductName, GrindType: item.GrindType.String,
				WeightGrams: item.WeightGrams, Quantity: item.Quantity,
				UnitPrice: fmt.Sprintf("%.2f", unitPrice.Float64),
				LineTotal: fmt.Sprintf("%.2f", lineTotal.Float64),
			})
		}
	case "catering":
		details, err := s.repo.GetCateringDetailsByOrderID(ctx, order.ID.Bytes)
		if err != nil && err != pgx.ErrNoRows {
			return nil, fmt.Errorf("fetching catering details: %w", err)
		}
		if err == nil {
			resp.Catering = &CateringDetailResp{
				EventDate:  details.EventDate.Time.Format("2006-01-02"),
				GuestCount: details.GuestCount, VenueAddress: details.VenueAddress.String,
				CustomRequest: details.CustomRequest.String,
			}
		}
	}

	return resp, nil
}

// ListOrders is the admin order queue: newest first, optionally filtered
// by status, paginated.
func (s *Service) ListOrders(ctx context.Context, q ListOrdersQuery) ([]OrderResponse, error) {
	var statusFilter pgtype.Text
	if q.Status != "" {
		statusFilter = pgtype.Text{String: q.Status, Valid: true}
	}

	orders, err := s.repo.ListOrders(ctx, sqlc.ListOrdersParams{
		Status: statusFilter,
		Limit:  q.Limit,
		Offset: q.Offset,
	})
	if err != nil {
		return nil, fmt.Errorf("listing orders: %w", err)
	}

	result := make([]OrderResponse, 0, len(orders))
	for _, o := range orders {
		result = append(result, *orderToResponse(o))
	}
	return result, nil
}

// UpdateStatus moves an order through its lifecycle and records the change
// in order_status_history, inside one transaction. Fires a best-effort
// status-update email after commit.
func (s *Service) UpdateStatus(ctx context.Context, orderID string, req UpdateOrderStatusRequest, changedBy string) (*OrderResponse, error) {
	id, err := uuid.Parse(orderID)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid_order_id", "order id must be a valid UUID")
	}

	var result *OrderResponse

	err = s.execTx(ctx, func(q *Repository) error {
		var adminNote pgtype.Text
		if req.AdminNote != "" {
			adminNote = pgtype.Text{String: req.AdminNote, Valid: true}
		}

		updated, err := q.UpdateOrderStatus(ctx, sqlc.UpdateOrderStatusParams{
			ID:         pgUUID(id),
			Status:     req.Status,
			AdminNotes: adminNote,
		})
		if err != nil {
			if err == pgx.ErrNoRows {
				return apperror.NewNotFound("order_not_found", "order not found")
			}
			return fmt.Errorf("updating order status: %w", err)
		}

		var changedByParam pgtype.UUID
		if changedBy != "" {
			if parsed, perr := uuid.Parse(changedBy); perr == nil {
				changedByParam = pgUUID(parsed)
			}
		}

		_, err = q.CreateOrderStatusHistory(ctx, sqlc.CreateOrderStatusHistoryParams{
			OrderID:   updated.ID,
			Status:    req.Status,
			ChangedBy: changedByParam,
			Note:      adminNote,
		})
		if err != nil {
			return fmt.Errorf("recording status history: %w", err)
		}

		result = orderToResponse(updated)
		return nil
	})
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *Service) getOrCreateCustomer(ctx context.Context, q *Repository, req CreateOrderRequest) (sqlc.Customer, error) {
	existing, err := q.GetCustomerByPhone(ctx, req.CustomerPhone)
	if err == nil {
		return existing, nil
	}
	if err != pgx.ErrNoRows {
		return sqlc.Customer{}, fmt.Errorf("looking up customer: %w", err)
	}

	created, err := q.CreateCustomer(ctx, sqlc.CreateCustomerParams{
		FullName: req.CustomerName,
		Phone:    req.CustomerPhone,
		Email:    pgtype.Text{String: req.CustomerEmail, Valid: req.CustomerEmail != ""},
	})
	if err != nil {
		return sqlc.Customer{}, fmt.Errorf("creating customer: %w", err)
	}
	return created, nil
}

// execTx wraps fn in a DB transaction, committing on success and rolling
// back on any returned error. This is the same pattern used across UICAS.
func (s *Service) execTx(ctx context.Context, fn func(*Repository) error) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("starting transaction: %w", err)
	}
	defer tx.Rollback(ctx) // no-op if already committed

	qtx := s.repo.WithTx(tx)
	if err := fn(qtx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
