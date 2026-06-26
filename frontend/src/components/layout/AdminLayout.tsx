import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/orders", label: "📋 Orders" },
  { to: "/admin/products", label: "☕ Products" },
  { to: "/admin/catering-packages", label: "🍴 Catering Packages" },
  { to: "/admin/customers", label: "👥 Customers" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const currentPage = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.label.replace(/^\S+ /, "") ?? "Admin";

  return (
    <>
      <style>{`
        .admin-wrap { min-height: 100vh; display: flex; background: #f5f0e8; }
        .admin-sidebar {
          width: 220px; background: #2b2118; color: #fff;
          display: flex; flex-direction: column; padding: 1.25rem 0;
          flex-shrink: 0; z-index: 50;
        }
        .admin-topbar { display: none; }
        .admin-backdrop { display: none; }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed; top: 0; left: -220px; height: 100vh;
            transition: left 0.25s ease;
          }
          .admin-sidebar.open { left: 0; }
          .admin-topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1rem; background: #2b2118; color: #fff;
            position: sticky; top: 0; z-index: 30;
          }
          .admin-backdrop {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 40;
          }
        }
      `}</style>

      <div className="admin-wrap">

        {/* Backdrop */}
        {sidebarOpen && (
          <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
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
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    padding: "0.7rem 1.25rem", color: "#fff", textDecoration: "none",
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
                background: "transparent", color: "#fff", border: "1px solid #555",
                borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer",
                width: "100%", fontSize: "0.85rem",
              }}
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Mobile top bar */}
          <div className="admin-topbar">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{
                background: "transparent", border: "none", color: "#fff",
                fontSize: "1.5rem", cursor: "pointer", lineHeight: 1, padding: "0.2rem 0.4rem",
              }}
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{currentPage}</span>
            <span style={{ fontSize: "0.78rem", color: "#bbb" }}>{user?.username}</span>
          </div>

          <main style={{ flex: 1, padding: "1.25rem", overflowX: "auto" }}>
            <Outlet />
          </main>
        </div>

      </div>
    </>
  );
}
