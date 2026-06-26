import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/orders", label: "📋 Orders" },
  { to: "/admin/products", label: "☕ Products" },
  { to: "/admin/catering-packages", label: "🍴 Catering Packages" },
  { to: "/admin/customers", label: "👥 Customers" },
];

// Detect mobile using window.innerWidth — avoids CSS specificity fights
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const currentPage = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.label.replace(/^\S+ /, "") ?? "Admin";

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f0e8" }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.75rem 1rem", background: "#2b2118", color: "#fff",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "transparent", border: "none", color: "#fff",
              fontSize: "1.6rem", cursor: "pointer", lineHeight: 1,
              padding: "0.1rem 0.4rem",
            }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{currentPage}</span>
          <span style={{ fontSize: "0.78rem", color: "#bbb" }}>{user?.username}</span>
        </div>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        {/* Backdrop on mobile */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
              zIndex: 40,
            }}
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: 220,
          background: "#2b2118",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem 0",
          flexShrink: 0,
          zIndex: 45,
          // Mobile: fixed slide-in; Desktop: normal flow
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: sidebarOpen ? 0 : -220,
            height: "100vh",
            transition: "left 0.25s ease",
          } : {
            position: "relative",
          }),
        }}>
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

        {/* Main content */}
        <main style={{
          flex: 1, padding: "1.25rem", overflowX: "auto", minWidth: 0,
          // On mobile push content right of fixed sidebar when open
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
