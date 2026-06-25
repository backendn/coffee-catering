import { Link } from "react-router-dom";
import "../../styles/promo.css";

export default function PublicFooter() {
  return (
    <footer
      style={{
        background: "#120d0a",
        color: "var(--parchment-dim)",
        fontFamily: "var(--font-body)",
        borderTop: "1px solid rgba(242,233,220,0.07)",
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 3rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {/* Brand column */}
        <div style={{ gridColumn: "span 1" }}>
          <img
            src="/images/logo.png"
            alt="Soma Coffee & Catering"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            style={{ height: 44, width: "auto", objectFit: "contain", marginBottom: "1rem", display: "block" }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              color: "var(--parchment)",
              margin: "0 0 0.6rem",
              lineHeight: 1.4,
            }}
          >
            Soma Coffee Powder Manufacturing &amp; Catering
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}>
            Roasted and ground with care in Addis Ababa — delivering quality coffee
            and full event catering across Ethiopia.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={headingStyle}>Quick Links</h4>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/catalog">Shop Coffee</FooterLink>
            <FooterLink to="/catering">Catering</FooterLink>
            <FooterLink to="/checkout">Cart</FooterLink>
          </nav>
        </div>

        {/* Services */}
        <div>
          <h4 style={headingStyle}>Our Services</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {[
              "Coffee Powder Delivery",
              "Wedding Catering",
              "Birthday Events",
              "Meetings & Programs",
              "Enjera Delivery",
              "Agelgel Delivery",
            ].map((s) => (
              <li key={s} style={{ fontSize: "0.875rem" }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={headingStyle}>Contact Us</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
            <div>
              <div style={labelStyle}>Phone / WhatsApp</div>
              <a href="tel:6150" style={linkStyle}>📞 6150</a>
              <br />
              <a href="tel:0911317531" style={linkStyle}>📞 0911 317 531</a>
            </div>
            <div>
              <div style={labelStyle}>Telegram</div>
              <a href="https://t.me/somacoffee" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                @somacoffee
              </a>
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <a href="mailto:hello@somacoffee.et" style={linkStyle}>hello@somacoffee.et</a>
            </div>
            <div>
              <div style={labelStyle}>Location</div>
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h4 style={headingStyle}>About Us</h4>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, margin: "0 0 0.75rem" }}>
            Soma Coffee began with a simple belief — that Ethiopian coffee, roasted
            and ground with honest care, should reach every home and every event at
            its freshest. We source washed single-origin beans from Yirgacheffe and
            Harar, roast in small batches, and grind to order.
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
            Our catering team brings the full Ethiopian coffee and food experience
            to weddings, corporate events, birthdays, and gatherings of any size.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(242,233,220,0.06)",
          padding: "1.1rem clamp(1.25rem, 5vw, 3rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.8rem",
          color: "rgba(201,189,169,0.6)",
        }}
      >
        <span>© {new Date().getFullYear()} Soma Coffee Powder Manufacturing & Catering. All rights reserved.</span>
        <span>Addis Ababa, Ethiopia 🇪🇹</span>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={linkStyle}>{children}</Link>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  color: "var(--gold-soft)",
  margin: "0 0 1rem",
  letterSpacing: "0.02em",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--gold-soft)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "0.2rem",
};

const linkStyle: React.CSSProperties = {
  color: "var(--parchment-dim)",
  textDecoration: "none",
  fontSize: "0.875rem",
  transition: "color 0.15s",
};
