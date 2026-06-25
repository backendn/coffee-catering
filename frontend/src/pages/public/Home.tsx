import { Link } from "react-router-dom";
import { CATERING_SERVICES } from "../../data/cateringServices";
import Slideshow from "../../components/ui/Slideshow";
import "../../styles/promo.css";

// --- Process steps: roasting -> grinding -> packaging. Drop your photos
// at the paths below (public/images/process/) — roughly 4:5 portrait
// crops work best with the slideshow frame.
const PROCESS_STEPS = [
  { img: "/images/process/04-roasting.jpg", label: "Roasting", sublabel: "01" },
  { img: "/images/process/05-grinding.jpg", label: "Grinding", sublabel: "02" },
  { img: "/images/process/06-packaging.jpg", label: "Packaging", sublabel: "03" },
];

// Final package photos — drop at public/images/packages/. Captions are
// editable here; swap in your real product names/weights once products
// exist via the admin Products page.
const PACKAGE_PHOTOS = [
  { img: "/images/packages/01.jpg", label: "Whole Bean, 1kg", sublabel: "Single-origin, medium roast" },
  { img: "/images/packages/02.jpg", label: "Ground, 500g", sublabel: "Espresso grind" },
  { img: "/images/packages/03.jpg", label: "Ground, 250g", sublabel: "Filter grind" },
];

// Catering event photos — drop at public/images/catering/.
const CATERING_PHOTOS = [
  { img: "/images/catering/01.jpg", label: "Corporate coffee bar" },
  { img: "/images/catering/02.jpg", label: "Wedding service" },
  { img: "/images/catering/03.jpg", label: "Private event setup" },
];

export default function Home() {
  return (
    <div className="promo">
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero__media">
          {/* Swap the poster image and add your video file at
              public/video/hero.mp4 — autoplay requires muted + playsInline
              to work reliably on mobile browsers. */}
          <video autoPlay muted loop playsInline poster="/images/process/04-roasting.jpg">
            <source src="/video/hero-desktop.mp4" media="(min-width: 768px)" type="video/mp4" />
            <source src="/video/hero1.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero__content">
          <span className="eyebrow">Roasted &amp; Ground in Addis Ababa</span>
          <h1 className="hero__title">Soma Coffee Products &amp; Catering</h1>
          <p className="hero__lede">
            Quality coffee powder, freshly roasted and ground to order — plus full event catering:
            food packages and Ethiopian traditional drinks, served wherever you need them.
          </p>
          <div className="hero__actions">
            <Link to="/catalog" className="btn btn--gold">
              Shop Coffee
            </Link>
            <Link to="/catering" className="btn btn--outline">
              Book Catering
            </Link>
          </div>
        </div>
      </section>

      {/* ============ PROCESS SLIDESHOW ============ */}
      <div className="filmstrip-wrap">
        <section style={{ paddingBottom: "3rem" }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">The Process</span>
              <h2>How it gets to you</h2>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 480px", maxWidth: 900 }}>
              <Slideshow items={PROCESS_STEPS} intervalMs={1600} aspectRatio="16 / 9" objectFit="contain" />
            </div>

            <div style={{ flex: "0 1 340px", borderLeft: "2px solid var(--gold)", paddingLeft: "1.5rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  lineHeight: 1.45,
                  color: "var(--parchment)",
                  margin: "0 0 1rem",
                }}
              >
                Washed quality coffee from Yirgacheffe and around Gojjam — some of the best
                coffee in our country.
              </p>
              <p
                style={{
                  color: "var(--parchment-dim)",
                  fontSize: "0.98rem",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                We roast it carefully and cleanly, then grind it with the latest technology.
                You'll love it when you taste it — as clean as the coffee from your mother's pot.
                Order with us and we'll deliver to you swiftly.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ============ FINAL PACKAGES ============ */}
      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">What You'll Receive</span>
            <h2>The finished package</h2>
          </div>
          <Link to="/catalog" className="btn btn--outline">
            View Full Shop
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 480px", maxWidth: 900 }}>
            <Slideshow items={PACKAGE_PHOTOS} intervalMs={1600} aspectRatio="16 / 9" />
          </div>

          <div style={{ flex: "0 1 340px", borderLeft: "2px solid var(--gold)", paddingLeft: "1.5rem" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.45rem",
                lineHeight: 1.4,
                color: "var(--parchment)",
                margin: "0 0 1rem",
              }}
            >
              Two packages. One standard of quality.
            </p>
            <p
              style={{
                color: "var(--parchment-dim)",
                fontSize: "0.98rem",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Choose roasted whole bean if you grind at home, or our ground coffee powder if
              you want it ready to brew straight away. Both are roasted and packaged fresh to
              order — and we deliver wherever you are.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CATERING TEASER ============ */}
      <section className="catering-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Catering</span>
            <h2>Full event catering, Ethiopian-style</h2>
          </div>
          <Link to="/catering" className="btn btn--sage">
            See Packages
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 480px", maxWidth: 900 }}>
            <Slideshow items={CATERING_PHOTOS} intervalMs={1800} aspectRatio="16 / 9" />
          </div>

          <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Services we cover</h3>
            {CATERING_SERVICES.map((s) => (
              <div
                key={s.en}
                style={{
                  border: "1px solid rgba(141,156,107,0.4)",
                  borderRadius: 2,
                  padding: "0.6rem 1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>{s.en}</span>
                <span style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif", color: "var(--sage-soft)", fontSize: "0.9rem" }}>
                  {s.am}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="cta-band">
        <h2>Ready to order?</h2>
        <div className="btn-row">
          <Link to="/catalog" className="btn btn--gold">
            Shop Coffee
          </Link>
          <Link to="/catering" className="btn btn--sage">
            Book Catering
          </Link>
        </div>
      </section>
    </div>
  );
}
