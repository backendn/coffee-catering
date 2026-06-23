import { useEffect, useState, type FormEvent } from "react";
import {
  listProducts,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  createVariantAdmin,
  updateVariantAdmin,
  deleteVariantAdmin,
  updateVariantStockAdmin,
} from "../../api/products";
import { getErrorMessage } from "../../api/client";
import type { Product, Variant } from "../../types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);

  function load() {
    setLoading(true);
    listProducts()
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <button onClick={() => setShowNewProduct((s) => !s)} style={primaryBtn}>
          {showNewProduct ? "Cancel" : "+ New Product"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {showNewProduct && (
        <ProductForm
          onSaved={() => { setShowNewProduct(false); load(); }}
          onError={setError}
          onCancel={() => setShowNewProduct(false)}
        />
      )}

      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p>No products yet — add your first one above.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onChange={load} onError={setError} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  initial,
  onSaved,
  onError,
  onCancel,
}: {
  initial?: Product;
  onSaved: () => void;
  onError: (e: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initial;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, slug, description: description || undefined, image_url: imageUrl || undefined };
      if (isEdit) {
        await updateProductAdmin(initial.id, payload);
      } else {
        await createProductAdmin(payload);
      }
      onSaved();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...card, display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
      <strong>{isEdit ? "Edit Product" : "New Product"}</strong>
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={input} />
      <input required placeholder="Slug (e.g. yirgacheffe-ground)" value={slug} onChange={(e) => setSlug(e.target.value)} style={input} />
      <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={input} />
      <input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={input} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={submitting} style={primaryBtn}>
          {submitting ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Product")}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  );
}

function ProductRow({ product, onChange, onError }: { product: Product; onChange: () => void; onError: (e: string) => void }) {
  const [showNewVariant, setShowNewVariant] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This will hide it from the shop.`)) return;
    setDeleting(true);
    try {
      await deleteProductAdmin(product.id);
      onChange();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ProductForm
        initial={product}
        onSaved={() => { setEditing(false); onChange(); }}
        onError={onError}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} />
          )}
          <div>
            <strong>{product.name}</strong>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>{product.slug}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setEditing(true)} style={secondaryBtn}>Edit</button>
          <button onClick={handleDelete} disabled={deleting} style={{ ...secondaryBtn, color: "crimson", borderColor: "crimson" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button onClick={() => setShowNewVariant((s) => !s)} style={secondaryBtn}>
            {showNewVariant ? "Cancel" : "+ Variant"}
          </button>
        </div>
      </div>

      {product.variants.length > 0 && (
        <table style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.85rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#888", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: "0.3rem 0.5rem" }}>SKU</th>
              <th style={{ padding: "0.3rem 0.5rem" }}>Grind</th>
              <th style={{ padding: "0.3rem 0.5rem" }}>Weight</th>
              <th style={{ padding: "0.3rem 0.5rem" }}>Price</th>
              <th style={{ padding: "0.3rem 0.5rem" }}>Stock</th>
              <th style={{ padding: "0.3rem 0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <VariantRow key={v.id} variant={v} onChanged={onChange} onError={onError} />
            ))}
          </tbody>
        </table>
      )}

      {showNewVariant && (
        <NewVariantForm
          productId={product.id}
          onCreated={() => { setShowNewVariant(false); onChange(); }}
          onError={onError}
        />
      )}
    </div>
  );
}

function VariantRow({ variant, onChanged, onError }: { variant: Variant; onChanged: () => void; onError: (e: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [sku, setSku] = useState(variant.sku);
  const [grindType, setGrindType] = useState(variant.grind_type ?? "");
  const [weight, setWeight] = useState(variant.weight_grams);
  const [price, setPrice] = useState(variant.price);
  const [stock, setStock] = useState(variant.stock_quantity);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateVariantAdmin(variant.id, {
        sku, grind_type: grindType || undefined,
        weight_grams: weight, price, stock_quantity: stock,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete variant "${variant.sku}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteVariantAdmin(variant.id);
      onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <tr style={{ background: "#fffdf8", borderBottom: "1px solid #eee" }}>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <input value={sku} onChange={(e) => setSku(e.target.value)} style={{ ...input, width: 90 }} />
        </td>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <input value={grindType} onChange={(e) => setGrindType(e.target.value)} style={{ ...input, width: 90 }} />
        </td>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ ...input, width: 70 }} />
        </td>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <input value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...input, width: 80 }} />
        </td>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} style={{ ...input, width: 70 }} />
        </td>
        <td style={{ padding: "0.4rem 0.5rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
              {saving ? "…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)} style={{ ...secondaryBtn, padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
      <td style={{ padding: "0.4rem 0.5rem" }}>{variant.sku}</td>
      <td style={{ padding: "0.4rem 0.5rem" }}>{variant.grind_type || "—"}</td>
      <td style={{ padding: "0.4rem 0.5rem" }}>{variant.weight_grams}g</td>
      <td style={{ padding: "0.4rem 0.5rem" }}>{variant.price} Birr</td>
      <td style={{ padding: "0.4rem 0.5rem" }}>{variant.stock_quantity}</td>
      <td style={{ padding: "0.4rem 0.5rem" }}>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button onClick={() => setEditing(true)} style={{ ...secondaryBtn, padding: "0.25rem 0.6rem", fontSize: "0.8rem" }}>
            Edit
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ ...secondaryBtn, padding: "0.25rem 0.6rem", fontSize: "0.8rem", color: "crimson", borderColor: "crimson" }}>
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function _StockEditor({ variantId, current, onSaved, onError }: { variantId: string; current: number; onSaved: () => void; onError: (e: string) => void }) {
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (value === current) return;
    setSaving(true);
    try {
      await updateVariantStockAdmin(variantId, value);
      onSaved();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      type="number" min={0} value={value} disabled={saving}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={save}
      style={{ width: 70, padding: "0.25rem", borderRadius: 4, border: "1px solid #ccc" }}
    />
  );
}

function NewVariantForm({ productId, onCreated, onError }: { productId: string; onCreated: () => void; onError: (e: string) => void }) {
  const [sku, setSku] = useState("");
  const [grindType, setGrindType] = useState("");
  const [weight, setWeight] = useState(250);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createVariantAdmin(productId, { sku, grind_type: grindType || undefined, weight_grams: weight, price, stock_quantity: stock });
      onCreated();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#888" }}>SKU</label>
        <input required placeholder="e.g. YRG-500G" value={sku} onChange={(e) => setSku(e.target.value)} style={{ ...input, width: 110 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#888" }}>Grind</label>
        <input placeholder="e.g. medium" value={grindType} onChange={(e) => setGrindType(e.target.value)} style={{ ...input, width: 110 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#888" }}>Weight (g)</label>
        <input required type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ ...input, width: 90 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#888" }}>Price (Birr)</label>
        <input required placeholder="350.00" value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...input, width: 90 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#888" }}>Stock</label>
        <input required type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} style={{ ...input, width: 80 }} />
      </div>
      <button type="submit" disabled={submitting} style={primaryBtn}>
        {submitting ? "Adding…" : "Add Variant"}
      </button>
    </form>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2dccf", borderRadius: 8, padding: "1rem" };
const input: React.CSSProperties = { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" };
const primaryBtn: React.CSSProperties = { background: "#4b3621", color: "#fff", border: "none", borderRadius: 4, padding: "0.5rem 1rem", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "transparent", color: "#4b3621", border: "1px solid #4b3621", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer" };
