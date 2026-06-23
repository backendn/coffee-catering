import { useParams, Link } from "react-router-dom";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <h1>Order Received!</h1>
      <p style={{ fontSize: "1.1rem" }}>
        Thanks for your order. Your reference number is:
      </p>
      <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1rem 0" }}>{orderNumber}</p>
      <p style={{ color: "#666" }}>
        We'll reach out by phone shortly to confirm the details and arrange payment.
      </p>
      <Link to="/catalog" style={{ color: "#4b3621", fontWeight: 600 }}>
        ← Continue Shopping
      </Link>
    </div>
  );
}
