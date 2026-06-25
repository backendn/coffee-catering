import { useEffect, useState, type FormEvent } from "react";
import { listCateringPackages } from "../../api/catering";
import { createOrder } from "../../api/orders";
import { getErrorMessage } from "../../api/client";
import { useNavigate } from "react-router-dom";
import type { CateringPackage } from "../../types";
import { CATERING_SERVICES } from "../../data/cateringServices";
import "../../styles/promo.css";

// Photos per package — keyed by package name for now since the backend
// doesn't store images yet. Add an entry here matching each package you
// create in the admin, or fall back to a generic catering photo.
const PACKAGE_IMAGES: Record<string, string> = {
  // "Coffee Bar for 50": "/images/catering/coffee-bar-50.jpg",
};
const FALLBACK_IMAGE = "/images/catering/01.jpg";

export default function Catering() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCateringPackages()
      .then(setPackages)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="promo">
      <section style={{ paddingBottom: "1rem" }}>
        <span className="eyebrow">Catering</span>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", margin: "0.6rem 0 1rem" }}>
          Food, drinks, and coffee — for your whole event
        </h1>
        <p style={{ color: "var(--parchment-dim)", maxWidth: "60ch" }}>
          From corporate mornings to weddings, we cater full food packages and Ethiopian
          traditional drinks alongside our coffee service — equipment, staff, and everything
          set up wherever you need it.
        </p>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">What We Cater</span>
            <h2>Services we cover</h2>
          </div>
        </div>
        <div className="pkg-grid">
          {CATERING_SERVICES.map((s) => (
            <div className="pkg-card" key={s.en}>
              <div className="pkg-card__body">
                <h3>{s.en}</h3>
                <p style={{ color: "var(--gold-soft)", fontFamily: "'Noto Sans Ethiopic', sans-serif", fontSize: "1.05rem" }}>
                  {s.am}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        {loading && <p>Loading packages…</p>}
        {error && <p style={{ color: "#e08a6b" }}>{error}</p>}
        {!loading && packages.length === 0 && !error && (
          <p style={{ color: "var(--parchment-dim)" }}>
            No packages published yet — reach out directly and we'll put together a custom quote.
          </p>
        )}

        <div className="pkg-grid">
          {packages.map((p) => (
            <div className="pkg-card" key={p.id}>
              <img
                className="pkg-card__img"
                src={PACKAGE_IMAGES[p.name] ?? FALLBACK_IMAGE}
                alt={p.name}
                loading="lazy"
              />
              <div className="pkg-card__body">
                <h3>{p.name}</h3>
                {p.description && <p>{p.description}</p>}
                <p style={{ color: "var(--gold-soft)", fontWeight: 600 }}>
                  {p.price_per_guest ? `${p.price_per_guest} Birr / guest` : null}
                  {p.price_per_guest && p.flat_price ? " · " : null}
                  {p.flat_price ? `${p.flat_price} Birr flat` : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="catering-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Request a Booking</span>
            <h2>Tell us about your event</h2>
          </div>
        </div>
        <BookingForm packages={packages} />
      </section>
    </div>
  );
}

function BookingForm({ packages }: { packages: CateringPackage[] }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    if (digitsOnly.length === 0) {
      setPhoneError(null);
    } else if (digitsOnly.length < 9) {
      setPhoneError("Phone number is too short");
    } else if (digitsOnly.length > 10) {
      setPhoneError("Phone number is too long");
    } else if (!/^(09|07)/.test(digitsOnly) && !/^[0-9]{4}$/.test(digitsOnly)) {
      setPhoneError("Enter a valid Ethiopian phone number (e.g. 0911317531)");
    } else {
      setPhoneError(null);
    }
  }
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guestCount, setGuestCount] = useState(20);
  const [venueAddress, setVenueAddress] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (phoneError) { setError("Please enter a valid phone number."); return; }
    setSubmitting(true);
    try {
      const order = await createOrder({
        order_type: "catering",
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        delivery_method: "delivery",
        delivery_address: venueAddress,
        catering: {
          catering_package_id: packageId || undefined,
          event_date: eventDate,
          event_time: eventTime || undefined,
          guest_count: guestCount,
          venue_address: venueAddress,
          custom_request: customRequest || undefined,
        },
      });
      setDone(order.order_number);
      setTimeout(() => navigate(`/order-confirmation/${order.order_number}`), 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p style={{ color: "var(--sage-soft)" }}>Booking request sent — reference {done}. Redirecting…</p>;
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.7rem",
    background: "var(--ink)",
    border: "1px solid rgba(242,233,220,0.18)",
    color: "var(--parchment)",
    borderRadius: 2,
    fontFamily: "var(--font-body)",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", maxWidth: 760 }}>
      <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <input
          required
          type="tel"
          inputMode="numeric"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          style={{ ...inputStyle, borderColor: phoneError ? "#e08a6b" : undefined }}
        />
        {phoneError && (
          <span style={{ color: "#e08a6b", fontSize: "0.78rem" }}>⚠ {phoneError}</span>
        )}
      </div>
      <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

      <select value={packageId} onChange={(e) => setPackageId(e.target.value)} style={inputStyle}>
        <option value="">Choose a package (optional)</option>
        {packages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={inputStyle} />
      <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} style={inputStyle} />
      <input
        required
        type="number"
        min={1}
        placeholder="Guest count"
        value={guestCount}
        onChange={(e) => setGuestCount(Number(e.target.value))}
        style={inputStyle}
      />
      <input
        required
        placeholder="Venue address"
        value={venueAddress}
        onChange={(e) => setVenueAddress(e.target.value)}
        style={{ ...inputStyle, gridColumn: "1 / -1" }}
      />
      <textarea
        placeholder="Anything else we should know? (optional)"
        value={customRequest}
        onChange={(e) => setCustomRequest(e.target.value)}
        rows={3}
        style={{ ...inputStyle, gridColumn: "1 / -1" }}
      />

      {error && <p style={{ color: "#e08a6b", gridColumn: "1 / -1" }}>{error}</p>}

      <button type="submit" disabled={submitting} className="btn btn--sage" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
        {submitting ? "Sending…" : "Request Booking"}
      </button>
    </form>
  );
}
