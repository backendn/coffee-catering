import { useEffect, useState } from "react";
import { listOrdersAdmin, updateOrderStatus } from "../../api/orders";
import { getErrorMessage } from "../../api/client";
import type { Order } from "../../types";

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

  function load() {
    setLoading(true);
    listOrdersAdmin({ status: statusFilter || undefined })
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

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
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p>No orders {statusFilter ? `with status "${STATUS_LABELS[statusFilter]}"` : "yet"}.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#efe7d8" }}>
                <Th>Order #</Th>
                <Th>Type</Th>
                <Th>Phone</Th>
                <Th>Subtotal</Th>
                <Th>Placed</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderTop: "1px solid #eee" }}>
                  <Td>{order.order_number}</Td>
                  <Td style={{ textTransform: "capitalize" }}>{order.order_type}</Td>
                  <Td>{order.contact_phone}</Td>
                  <Td>{order.subtotal} Birr</Td>
                  <Td>{new Date(order.created_at).toLocaleString()}</Td>
                  <Td>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      style={{ padding: "0.35rem", borderRadius: 4 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{children}</th>;
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "0.75rem", fontSize: "0.9rem", ...style }}>{children}</td>;
}
