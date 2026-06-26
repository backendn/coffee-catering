// frontend/src/pages/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOrdersAdmin } from "../../api/orders";
import { listProducts } from "../../api/products";
import { listCateringPackages } from "../../api/catering";
import { listCustomersAdmin } from "../../api/customers";
import { getErrorMessage } from "../../api/client";
import type { Order, Product, CateringPackage } from "../../types";
import type { Customer } from "../../api/customers";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listOrdersAdmin({}),
      listProducts(),
      listCateringPackages(),
      listCustomersAdmin({}),
    ])
      .then(([o, p, cp, c]) => {
        setOrders(o);
        setProducts(p);
        setPackages(cp);
        setCustomers(c);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard…</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  // --- Derived stats ---
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === "completed");
  const revenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.subtotal || 0),
    0
  );
  const cateringOrders = orders.filter((o) => o.order_type === "catering");

  const lowStockVariants = products.flatMap((p) =>
    p.variants
      .filter((v) => v.stock_quantity <= LOW_STOCK_THRESHOLD)
      .map((v) => ({ product: p, variant: v }))
  );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  return (
    <div>
      <h1 style={{ margin: "0 0 1.25rem" }}>Dashboard</h1>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <StatCard label="Active Orders" value={activeOrders.length} accent="#4b3621" />
        <StatCard label="Pending" value={pendingOrders.length} accent="#a65a36" />
        <StatCard
          label="Revenue (Completed)"
          value={`${revenue.toLocaleString()} Birr`}
          accent="#6b7a4f"
        />
        <StatCard label="Customers" value={customers.length} accent="#4b3621" />
        <StatCard label="Products" value={products.length} accent="#4b3621" />
        <StatCard label="Catering Packages" value={packages.length} accent="#6b7a4f" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "1.25rem",
        }}
      >
        {/* Recent orders */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <strong>Recent Orders</strong>
            <Link to="/admin/orders" style={{ fontSize: "0.85rem", color: "#4b3621" }}>
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>No orders yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid #f0ebe0",
                    fontSize: "0.875rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.order_number}</div>
                    <div style={{ color: "#888", fontSize: "0.78rem" }}>
                      {new Date(o.created_at).toLocaleDateString()} ·{" "}
                      <span style={{ textTransform: "capitalize" }}>{o.order_type}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontWeight: 600 }}>{o.subtotal} Birr</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 12,
                        background: "#efe7d8",
                        color: "#4b3621",
                      }}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock + catering snapshot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={card}>
            <strong style={{ display: "block", marginBottom: "0.75rem" }}>Low Stock</strong>
            {lowStockVariants.length === 0 ? (
              <p style={{ color: "#888", fontSize: "0.85rem", margin: 0 }}>
                All variants are well stocked.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {lowStockVariants.slice(0, 6).map(({ product, variant }) => (
                  <div
                    key={variant.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      borderBottom: "1px solid #f5f5f5",
                      paddingBottom: "0.4rem",
                    }}
                  >
                    <span>
                      {product.name}{" "}
                      <span style={{ color: "#888" }}>({variant.sku})</span>
                    </span>
                    <span style={{ color: variant.stock_quantity === 0 ? "crimson" : "#a65a36", fontWeight: 600 }}>
                      {variant.stock_quantity} left
                    </span>
                  </div>
                ))}
                <Link to="/admin/products" style={{ fontSize: "0.8rem", color: "#4b3621", marginTop: "0.25rem" }}>
                  Manage products →
                </Link>
              </div>
            )}
          </div>

          <div style={card}>
            <strong style={{ display: "block", marginBottom: "0.75rem" }}>Catering</strong>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#666" }}>
              {cateringOrders.length} catering order{cateringOrders.length === 1 ? "" : "s"} total
            </p>
            <Link to="/admin/catering-packages" style={{ fontSize: "0.8rem", color: "#4b3621" }}>
              Manage packages →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div style={{ ...card, borderLeft: `4px solid ${accent}` }}>
      <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2b2118" }}>{value}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2dccf",
  borderRadius: 8,
  padding: "1rem",
};