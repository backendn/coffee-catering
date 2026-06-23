import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../../api/products";
import { getErrorMessage } from "../../api/client";
import { useCart } from "../../components/cart/CartProvider";
import type { Product, Variant } from "../../types";
import "../../styles/promo.css";

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastProduct, setToastProduct] = useState<string | null>(null);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function showToast(name: string) {
    setToastProduct(name);
    setTimeout(() => setToastProduct(null), 2500);
  }

  return (
    <div className="promo" style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* Toast notification */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
          background: "var(--gold)",
          color: "var(--ink)",
          padding: "0.75rem 1.25rem",
          borderRadius: 4,
          fontWeight: 600,
          fontSize: "0.9rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: toastProduct ? 1 : 0,
          transform: toastProduct ? "translateY(0)" : "translateY(12px)",
          pointerEvents: "none",
        }}
      >
        ✓ {toastProduct} added to cart
      </div>

      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop</span>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginTop: "0.4rem" }}>
              Coffee Packages
            </h1>
          </div>
          <Link to="/checkout" className="btn btn--gold">
            View Cart
          </Link>
        </div>

        {loading && (
          <div style={{ color: "var(--parchment-dim)", padding: "3rem 0" }}>
            Loading products…
          </div>
        )}

        {error && (
          <div style={{ color: "#e08a6b", padding: "3rem 0" }}>{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{ color: "var(--parchment-dim)", padding: "3rem 0" }}>
            No products available right now — check back soon.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "1rem",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={showToast} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (name: string) => void;
}) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.in_stock)?.id ?? product.variants[0]?.id ?? ""
  );
  const selected = product.variants.find((v) => v.id === selectedVariantId);
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    if (!selected || !selected.in_stock) return;
    addItem(product, selected, quantity);
    onAddToCart(product.name);
  }

  return (
    <div
      style={{
        background: "var(--ink-soft)",
        border: "1px solid rgba(242,233,220,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          background: "#2e231b",
          overflow: "hidden",
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(242,233,220,0.2)",
              fontSize: "2.5rem",
            }}
          >
            ☕
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "1.1rem 1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        <div>
          <h3 style={{ margin: "0 0 0.3rem", fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{ color: "var(--parchment-dim)", fontSize: "0.88rem", margin: 0, lineHeight: 1.55 }}>
              {product.description}
            </p>
          )}
        </div>

        {/* Variant pills */}
        {product.variants.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {product.variants.map((v) => (
              <VariantPill
                key={v.id}
                variant={v}
                selected={v.id === selectedVariantId}
                onSelect={() => v.in_stock && setSelectedVariantId(v.id)}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {/* Quantity stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--parchment-dim)", fontSize: "0.85rem" }}>Qty:</span>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: 28, height: 28, border: "1px solid rgba(242,233,220,0.2)",
                background: "transparent", color: "var(--parchment)", borderRadius: 2,
                cursor: "pointer", fontSize: "1rem", lineHeight: 1,
              }}
            >−</button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              style={{
                width: 52, textAlign: "center", padding: "0.25rem",
                background: "var(--ink)", border: "1px solid rgba(242,233,220,0.2)",
                color: "var(--parchment)", borderRadius: 2, fontSize: "0.9rem",
              }}
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              style={{
                width: 28, height: 28, border: "1px solid rgba(242,233,220,0.2)",
                background: "transparent", color: "var(--parchment)", borderRadius: 2,
                cursor: "pointer", fontSize: "1rem", lineHeight: 1,
              }}
            >+</button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {selected && (
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold-soft)" }}>
                  {(Number(selected.price) * quantity).toFixed(2)}{" "}
                  <span style={{ fontSize: "0.85rem" }}>Birr</span>
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!selected?.in_stock}
              style={{
                background: selected?.in_stock ? "var(--gold)" : "rgba(242,233,220,0.1)",
                color: selected?.in_stock ? "var(--ink)" : "var(--parchment-dim)",
                border: "none", borderRadius: 2, padding: "0.6rem 1.1rem",
                fontWeight: 600, fontSize: "0.9rem",
                cursor: selected?.in_stock ? "pointer" : "not-allowed",
                transition: "background 0.18s ease, transform 0.18s ease",
              }}
              onMouseEnter={(e) => selected?.in_stock && ((e.target as HTMLButtonElement).style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.transform = "none")}
            >
              {selected?.in_stock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantPill({
  variant,
  selected,
  onSelect,
}: {
  variant: Variant;
  selected: boolean;
  onSelect: () => void;
}) {
  const parts = [
    variant.grind_type,
    `${variant.weight_grams}g`,
  ].filter(Boolean).join(" · ");

  return (
    <button
      onClick={onSelect}
      disabled={!variant.in_stock}
      style={{
        padding: "0.3rem 0.7rem",
        borderRadius: 2,
        border: selected
          ? "1px solid var(--gold)"
          : "1px solid rgba(242,233,220,0.18)",
        background: selected ? "rgba(201,162,39,0.12)" : "transparent",
        color: !variant.in_stock
          ? "rgba(242,233,220,0.25)"
          : selected
          ? "var(--gold-soft)"
          : "var(--parchment-dim)",
        fontSize: "0.82rem",
        cursor: variant.in_stock ? "pointer" : "not-allowed",
        textDecoration: !variant.in_stock ? "line-through" : "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {parts}
    </button>
  );
}
