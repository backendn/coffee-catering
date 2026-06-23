import { Link, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import PublicFooter from "./Publicfooter";

export default function PublicLayout() {
  const { itemCount } = useCart();
  const location = useLocation();
  // Home and Catering render their own full-bleed dark sections; everything
  // else (Catalog, Checkout, confirmation) keeps a simple padded container.
  const isFullBleed = location.pathname === "/" || location.pathname === "/catering";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#1b1410" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 1.5rem",
          background: "#1b1410",
          borderBottom: "1px solid rgba(242,233,220,0.08)",
          color: "#f2e9dc",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            color: "#f2e9dc",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
          }}
        >
          <img
            src="/images/logo.png"
            alt="Soma Coffee & Catering"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 42, width: "auto", objectFit: "contain" }}
          />
          <span
            style={{
              fontWeight: 600,
              fontSize: "1.15rem",
              fontFamily: "Fraunces, Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            Soma Coffee &amp; Catering
          </span>
        </Link>
        <nav style={{ display: "flex", gap: "1.75rem", alignItems: "center", fontSize: "0.92rem" }}>
          <Link to="/catalog" style={{ color: "#f2e9dc", textDecoration: "none" }}>
            Shop
          </Link>
          <Link to="/catering" style={{ color: "#f2e9dc", textDecoration: "none" }}>
            Catering
          </Link>
          <Link
            to="/checkout"
            style={{
              color: "#1b1410",
              background: "#c9a227",
              textDecoration: "none",
              padding: "0.5rem 0.9rem",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>
      </header>

      <main
        style={
          isFullBleed
            ? { flex: 1 }
            : { flex: 1, padding: "2rem 1.5rem", maxWidth: 960, margin: "0 auto", width: "100%", background: "#f5f0e8", color: "#2b2118" }
        }
      >
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
