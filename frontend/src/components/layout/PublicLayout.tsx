import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import PublicFooter from "./Publicfooter";

export default function PublicLayout() {
  const { itemCount } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFullBleed = location.pathname === "/" || location.pathname === "/catering";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#1b1410" }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.9rem 1.25rem",
        background: "#1b1410",
        borderBottom: "1px solid rgba(242,233,220,0.08)",
        color: "#f2e9dc",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <Link to="/" onClick={() => setMenuOpen(false)} style={{
          color: "#f2e9dc", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "0.6rem", flex: "0 0 auto",
        }}>
          <img
            src="/images/logo.png"
            alt="Soma Coffee & Catering"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 38, width: "auto", objectFit: "contain" }}
          />
          <span style={{
            fontWeight: 600, fontSize: "1.05rem",
            fontFamily: "Fraunces, Georgia, serif", letterSpacing: "-0.01em",
          }}>
            Soma Coffee &amp; Catering
          </span>
        </Link>

        {/* Desktop nav — visible on screens wider than 640px */}
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.92rem" }}>
          <Link to="/catalog" style={{ color: "#f2e9dc", textDecoration: "none" }}>Shop</Link>
          <Link to="/catering" style={{ color: "#f2e9dc", textDecoration: "none" }}>Catering</Link>
          <Link to="/checkout" style={{
            color: "#1b1410", background: "#c9a227", textDecoration: "none",
            padding: "0.45rem 0.85rem", borderRadius: 2, fontWeight: 600,
          }}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          {/* Hamburger — only visible on mobile via CSS */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="hamburger-btn"
            style={{
              background: "transparent", border: "none", color: "#f2e9dc",
              cursor: "pointer", padding: "0.3rem", fontSize: "1.4rem", lineHeight: 1,
              display: "none",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </nav>
      </header>

      {/* Mobile dropdown — hidden on desktop via CSS */}
      {menuOpen && (
        <div className="mobile-dropdown" style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 99,
          background: "#251c16", borderBottom: "1px solid rgba(242,233,220,0.1)",
          flexDirection: "column",
        }}>
          <Link to="/catalog" onClick={() => setMenuOpen(false)} style={{ color: "#f2e9dc", textDecoration: "none", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(242,233,220,0.06)" }}>Shop</Link>
          <Link to="/catering" onClick={() => setMenuOpen(false)} style={{ color: "#f2e9dc", textDecoration: "none", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(242,233,220,0.06)" }}>Catering</Link>
          <Link to="/checkout" onClick={() => setMenuOpen(false)} style={{ color: "#f2e9dc", textDecoration: "none", padding: "1rem 1.5rem" }}>Cart{itemCount > 0 ? ` (${itemCount})` : ""}</Link>
        </div>
      )}

      <main style={
        isFullBleed
          ? { flex: 1 }
          : { flex: 1, padding: "2rem 1.25rem", maxWidth: 960, margin: "0 auto", width: "100%", background: "#f5f0e8", color: "#2b2118" }
      }>
        <Outlet />
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 640px) {
          .hamburger-btn { display: block !important; }
          nav a:not(.hamburger-btn) { display: none !important; }
          .mobile-dropdown { display: flex !important; }
        }
        @media (min-width: 641px) {
          .hamburger-btn { display: none !important; }
          .mobile-dropdown { display: none !important; }
        }
      `}</style>
    </div>
  );
}
