import { useEffect, useState } from "react";
import { listCustomersAdmin, type Customer } from "../../api/customers";
import { getErrorMessage } from "../../api/client";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      listCustomersAdmin({ search: search || undefined })
        .then(setCustomers)
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 300); // debounce search input
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Customers</h1>
        <input
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc", width: 240 }}
        />
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading customers…</p>
      ) : customers.length === 0 ? (
        <p>No customers found{search ? ` matching "${search}"` : ""}.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", minWidth: 500 }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#efe7d8" }}>
              <th style={{ padding: "0.75rem" }}>Name</th>
              <th style={{ padding: "0.75rem" }}>Phone</th>
              <th style={{ padding: "0.75rem" }}>Email</th>
              <th style={{ padding: "0.75rem" }}>Orders</th>
              <th style={{ padding: "0.75rem" }}>Customer Since</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>{c.full_name}</td>
                <td style={{ padding: "0.75rem" }}>{c.phone}</td>
                <td style={{ padding: "0.75rem" }}>{c.email || "—"}</td>
                <td style={{ padding: "0.75rem" }}>{c.order_count}</td>
                <td style={{ padding: "0.75rem" }}>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
