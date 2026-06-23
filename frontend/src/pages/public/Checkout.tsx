import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/cart/CartProvider";
import { createOrder } from "../../api/orders";
import { getErrorMessage } from "../../api/client";

export default function Checkout() {
  const { lines, clear, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((sum, l) => sum + Number(l.variant.price) * l.quantity, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (deliveryMethod === "delivery" && !address.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        order_type: "product",
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === "delivery" ? address : undefined,
        customer_notes: notes || undefined,
        items: lines.map((l) => ({ product_variant_id: l.variant.id, quantity: l.quantity })),
      });
      clear();
      navigate(`/order-confirmation/${order.order_number}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div>
        <h1>Checkout</h1>
        <p>Your cart is empty. Head back to the shop to add some coffee first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>

      <div style={{ background: "#fff", border: "1px solid #e2dccf", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
        {lines.map((l) => (
          <div key={l.variant.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f0ebe0", gap: "0.75rem" }}>
            <span style={{ flex: 1, fontSize: "0.9rem" }}>
              {l.product.name}
              {l.variant.grind_type ? ` · ${l.variant.grind_type}` : ""} · {l.variant.weight_grams}g
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <button
                onClick={() => updateQuantity(l.variant.id, l.quantity - 1)}
                style={{ width: 26, height: 26, border: "1px solid #ccc", background: "transparent", borderRadius: 2, cursor: "pointer" }}
              >−</button>
              <input
                type="number"
                min={1}
                value={l.quantity}
                onChange={(e) => updateQuantity(l.variant.id, Math.max(1, Number(e.target.value)))}
                style={{ width: 50, textAlign: "center", border: "1px solid #ccc", borderRadius: 2, padding: "0.2rem" }}
              />
              <button
                onClick={() => updateQuantity(l.variant.id, l.quantity + 1)}
                style={{ width: 26, height: 26, border: "1px solid #ccc", background: "transparent", borderRadius: 2, cursor: "pointer" }}
              >+</button>
            </div>

            <span style={{ minWidth: 90, textAlign: "right", fontSize: "0.9rem" }}>
              {(Number(l.variant.price) * l.quantity).toFixed(2)} Birr
            </span>

            <button
              onClick={() => removeItem(l.variant.id)}
              style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1rem", padding: "0 0.25rem" }}
              title="Remove"
            >✕</button>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", fontWeight: 700 }}>
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)} Birr</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 420 }}>
        <Field label="Full Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone Number">
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX" />
        </Field>
        <Field label="Email (optional)">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Delivery Method">
          <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as "pickup" | "delivery")}>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </Field>

        {deliveryMethod === "delivery" && (
          <Field label="Delivery Address">
            <input required value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
        )}

        <Field label="Notes (optional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </Field>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          No payment is collected online yet — we'll contact you by phone to confirm your order and
          arrange payment.
        </p>

        <button
          type="submit"
          disabled={submitting}
          style={{ background: "#4b3621", color: "#fff", border: "none", borderRadius: 6, padding: "0.75rem", fontWeight: 600, cursor: "pointer" }}
        >
          {submitting ? "Placing order…" : "Place Order"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
      {label}
      {children}
    </label>
  );
}
