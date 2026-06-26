import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/catering-packages", label: "Catering Packages" },
  { to: "/admin/customers", label: "Customers" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: 220,
          background: "#2b2118",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img
            src="/images/logo.png"
            alt="Soma"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 34, width: "auto", objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Soma Coffee & Catering</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: "0.6rem 1.25rem",
                  color: "#fff",
                  textDecoration: "none",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: active ? "3px solid #d4a574" : "3px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: "0 1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#bbb", marginBottom: "0.5rem" }}>
            {user?.full_name || user?.username} ({user?.role})
          </div>
          <button
            onClick={handleLogout}
            style={{ background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer", width: "100%" }}
          >
            Log Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "1.5rem", background: "#f5f0e8", overflowX: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
