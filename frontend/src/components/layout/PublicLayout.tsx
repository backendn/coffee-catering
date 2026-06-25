import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import PublicFooter from "./Publicfooter";

const NAV_LINKS = [
  { to: "/catalog", label: "Shop" },
  { to: "/catering", label: "Catering" },
];

export default function PublicLayout() {
  const { itemCount } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFullBleed = location.pathname === "/" || location.pathname === "/catering";

  function closeMenu() { setMenuOpen(false); }

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
        <Link to="/" onClick={closeMenu} style={{ color: "#f2e9dc", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem", flex: "0 0 auto" }}>
          <img
            src="/images/logo.png"
            alt="Soma Coffee & Catering"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 38, width: "auto", objectFit: "contain" }}
          />
          {/* Brand name hidden on small screens to avoid crowding */}
          <span style={{
            fontWeight: 600,
            fontSize: "1.05rem",
            fontFamily: "Fraunces, Georgia, serif",
            letterSpacing: "-0.01em",
            display: "var(--brand-display, block)",
          }}>
            Soma Coffee &amp; Catering
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.92rem" }}
          className="desktop-nav">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} style={{ color: "#f2e9dc", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/checkout" style={{
            color: "#1b1410", background: "#c9a227", textDecoration: "none",
            padding: "0.45rem 0.85rem", borderRadius: 2, fontWeight: 600, fontSize: "0.9rem",
          }}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>

        {/* Mobile right side: cart + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="mobile-nav">
          <Link to="/checkout" onClick={closeMenu} style={{
            color: "#1b1410", background: "#c9a227", textDecoration: "none",
            padding: "0.4rem 0.75rem", borderRadius: 2, fontWeight: 600, fontSize: "0.85rem",
          }}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              background: "transparent", border: "none", color: "#f2e9dc",
              cursor: "pointer", padding: "0.3rem", fontSize: "1.4rem", lineHeight: 1,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 99,
          background: "#251c16", borderBottom: "1px solid rgba(242,233,220,0.1)",
          display: "flex", flexDirection: "column",
        }}
          className="mobile-dropdown">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to} to={l.to}
              onClick={closeMenu}
              style={{
                color: "#f2e9dc", textDecoration: "none",
                padding: "1rem 1.5rem", fontSize: "1rem",
                borderBottom: "1px solid rgba(242,233,220,0.06)",
              }}
            >
              {l.label}
            </Link>
          ))}
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

      {/* Responsive styles injected as a style tag — avoids adding a CSS file just for two breakpoints */}
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        .mobile-dropdown { display: flex; }

        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }

        @media (min-width: 641px) {
          .mobile-dropdown { display: none !important; }
        }
      `}</style>
    </div>
  );
}
