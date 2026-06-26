import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/orders", label: "📋 Orders" },
  { to: "/admin/products", label: "☕ Products" },
  { to: "/admin/catering-packages", label: "🍽 Catering Packages" },
  { to: "/admin/customers", label: "👥 Customers" },
];

export default function AdminLayout() {a
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMenu() {
    setSidebarOpen(false);
  }

  const currentPage = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.label ?? "Admin";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f0e8" }}>

      {/* ── Sidebar (desktop always visible, mobile as overlay) ── */}
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.5)",
            display: "none",
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        style={{
          width: 220,
          background: "#2b2118",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem 0",
          flexShrink: 0,
          position: "relative",
          zIndex: 50,
        }}
      >
        <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img
            src="/images/logo.png"
            alt="Soma"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 34, width: "auto", objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Soma Admin</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                style={{
                  padding: "0.7rem 1.25rem",
                  color: "#fff",
                  textDecoration: "none",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: active ? "3px solid #d4a574" : "3px solid transparent",
                  fontSize: "0.9rem",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "0 1.25rem" }}>
          <div style={{ fontSize: "0.78rem", color: "#bbb", marginBottom: "0.5rem" }}>
            {user?.full_name || user?.username} ({user?.role})
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent", color: "#fff",
              border: "1px solid #555", borderRadius: 4,
              padding: "0.4rem 0.75rem", cursor: "pointer", width: "100%", fontSize: "0.85rem",
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="admin-topbar"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            background: "#2b2118",
            color: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "transparent", border: "none", color: "#fff",
              fontSize: "1.4rem", cursor: "pointer", padding: "0.2rem", lineHeight: 1,
            }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {currentPage.replace(/^[\S]+ /, "")}
          </span>
          <span style={{ fontSize: "0.78rem", color: "#bbb" }}>{user?.username}</span>
        </div>

        <main style={{ flex: 1, padding: "1.25rem", overflowX: "auto" }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: -220px;
            height: 100vh;
            transition: left 0.25s ease;
          }
          .admin-sidebar.sidebar-open {
            left: 0 !important;
          }
          .sidebar-backdrop {
            display: block !important;
          }
          .admin-topbar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
