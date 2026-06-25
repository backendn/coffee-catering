import { useEffect, useState } from "react";
import { listOrdersAdmin, updateOrderStatus, getOrderByIdAdmin } from "../../api/orders";
import { getErrorMessage } from "../../api/client";
import type { Order, OrderItemResponse, CateringDetailResponse } from "../../types";

const STATUSES = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, Order>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listOrdersAdmin({ status: statusFilter || undefined })
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function handleToggleExpand(order: Order) {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(order.id);

    if (detailCache[order.order_number]) return;

    setLoadingDetail(order.id);
    try {
      const detail = await getOrderByIdAdmin(order.order_number);
      setDetailCache((prev) => ({ ...prev, [order.order_number]: detail }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingDetail(null);
    }
  }

  async function handleStatusChange(order: Order, newStatus: string) {
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 4 }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p>No orders {statusFilter ? `with status "${STATUS_LABELS[statusFilter]}"` : "yet"}.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const detail = detailCache[order.order_number];

            return (
              <div key={order.id} style={{ background: "#fff", border: "1px solid #e2dccf", borderRadius: 8, overflow: "hidden" }}>
                {/* Main row */}
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 140px 160px 180px", gap: "0.5rem", alignItems: "center", padding: "0.75rem 1rem", cursor: "pointer" }}
                  onClick={() => handleToggleExpand(order)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{order.order_number}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{order.contact_phone}</div>
                  </div>
                  <div style={{ fontSize: "0.85rem", textTransform: "capitalize", color: order.order_type === "catering" ? "#6b7a4f" : "#4b3621" }}>
                    {order.order_type}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{order.subtotal} Birr</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  <div>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(order, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ padding: "0.35rem", borderRadius: 4, fontSize: "0.85rem", width: "100%" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#888" }}>
                    {isExpanded ? "▲ Hide details" : "▼ View details"}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f0ebe0", padding: "0.75rem 1rem", background: "#fffdf8" }}>
                    {loadingDetail === order.id ? (
                      <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>Loading order details…</p>
                    ) : detail ? (
                      <OrderDetail order={detail} />
                    ) : (
                      <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>Could not load details.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Customer info */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
        <div><span style={labelStyle}>Phone:</span> {order.contact_phone}</div>
        <div><span style={labelStyle}>Delivery:</span> {order.delivery_method === "delivery" ? `Delivery — ${order.delivery_address}` : "Pickup"}</div>
        <div><span style={labelStyle}>Payment:</span> {order.payment_method} / {order.payment_status}</div>
        {order.customer_notes && <div><span style={labelStyle}>Note:</span> {order.customer_notes}</div>}
      </div>

      {/* Product order items */}
      {order.order_type === "product" && order.items && order.items.length > 0 && (
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#888", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Items Ordered
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e2dccf" }}>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Grind</th>
                <th style={thStyle}>Weight</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Unit Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: OrderItemResponse, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={tdStyle}><strong>{item.product_name}</strong></td>
                  <td style={tdStyle}>{item.grind_type || "—"}</td>
                  <td style={tdStyle}>{item.weight_grams}g</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={tdStyle}>{item.unit_price} Birr</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{item.line_total} Birr</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ padding: "0.5rem 0.4rem", textAlign: "right", fontWeight: 700, fontSize: "0.9rem" }}>Subtotal</td>
                <td style={{ padding: "0.5rem 0.4rem", textAlign: "right", fontWeight: 700 }}>{order.subtotal} Birr</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Catering details */}
      {order.order_type === "catering" && order.catering && (
        <CateringDetails catering={order.catering} />
      )}
    </div>
  );
}

function CateringDetails({ catering }: { catering: CateringDetailResponse }) {
  return (
    <div>
      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#888", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Catering Details
      </div>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem" }}>
        <div><span style={labelStyle}>Event Date:</span> {catering.event_date}</div>
        {catering.event_time && <div><span style={labelStyle}>Time:</span> {catering.event_time}</div>}
        <div><span style={labelStyle}>Guests:</span> {catering.guest_count}</div>
        {catering.venue_address && <div><span style={labelStyle}>Venue:</span> {catering.venue_address}</div>}
        {catering.custom_request && <div><span style={labelStyle}>Request:</span> {catering.custom_request}</div>}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { color: "#888", marginRight: "0.3rem" };
const thStyle: React.CSSProperties = { padding: "0.35rem 0.4rem", fontWeight: 600, color: "#666" };
const tdStyle: React.CSSProperties = { padding: "0.4rem 0.4rem" };
