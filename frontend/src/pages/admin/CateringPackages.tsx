import { useEffect, useState, type FormEvent } from "react";
import {
  listCateringPackages,
  createCateringPackageAdmin,
  updateCateringPackageAdmin,
  deleteCateringPackageAdmin,
} from "../../api/catering";
import { getErrorMessage } from "../../api/client";
import type { CateringPackage } from "../../types";

export default function CateringPackages() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  function load() {
    setLoading(true);
    listCateringPackages()
      .then(setPackages)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Catering Packages</h1>
        <button onClick={() => setShowNew((s) => !s)} style={primaryBtn}>
          {showNew ? "Cancel" : "+ New Package"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {showNew && (
        <PackageForm
          onSaved={() => { setShowNew(false); load(); }}
          onError={setError}
          onCancel={() => setShowNew(false)}
        />
      )}

      {loading ? (
        <p>Loading packages…</p>
      ) : packages.length === 0 ? (
        <p>No catering packages yet — add your first one above.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          {packages.map((p) => (
            <PackageRow key={p.id} pkg={p} onChange={load} onError={setError} />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageForm({
  initial,
  onSaved,
  onError,
  onCancel,
}: {
  initial?: CateringPackage;
  onSaved: () => void;
  onError: (e: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pricePerGuest, setPricePerGuest] = useState(initial?.price_per_guest ?? "");
  const [flatPrice, setFlatPrice] = useState(initial?.flat_price ?? "");
  const [minGuests, setMinGuests] = useState(String(initial?.min_guests ?? ""));
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initial;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        price_per_guest: pricePerGuest || undefined,
        flat_price: flatPrice || undefined,
        min_guests: minGuests ? Number(minGuests) : undefined,
        image_url: imageUrl || undefined,
      };
      if (isEdit) {
        await updateCateringPackageAdmin(initial.id, payload);
      } else {
        await createCateringPackageAdmin(payload);
      }
      onSaved();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...card, display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem", maxWidth: 480 }}>
      <strong>{isEdit ? "Edit Package" : "New Package"}</strong>
      <input required placeholder="Name (e.g. Coffee Bar for 50)" value={name} onChange={(e) => setName(e.target.value)} style={input} />
      <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={input} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input placeholder="Price per guest" value={pricePerGuest} onChange={(e) => setPricePerGuest(e.target.value)} style={input} />
        <input placeholder="Flat price" value={flatPrice} onChange={(e) => setFlatPrice(e.target.value)} style={input} />
      </div>
      <input placeholder="Min guests (optional)" type="number" value={minGuests} onChange={(e) => setMinGuests(e.target.value)} style={input} />
      <input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={input} />
      <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Set price per guest, flat price, or both.</p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={submitting} style={primaryBtn}>
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Package"}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtn}>Cancel</button>
      </div>
    </form>
  );
}

function PackageRow({ pkg, onChange, onError }: { pkg: CateringPackage; onChange: () => void; onError: (e: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${pkg.name}"? This will hide it from the catering page.`)) return;
    setDeleting(true);
    try {
      await deleteCateringPackageAdmin(pkg.id);
      onChange();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <PackageForm
        initial={pkg}
        onSaved={() => { setEditing(false); onChange(); }}
        onError={onError}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          {pkg.image_url && (
            <img src={pkg.image_url} alt={pkg.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
          )}
          <div>
          <strong style={{ fontSize: "1rem" }}>{pkg.name}</strong>
          {pkg.description && <p style={{ color: "#666", fontSize: "0.88rem", margin: "0.25rem 0 0" }}>{pkg.description}</p>}
          <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "#4b3621", fontWeight: 600 }}>
            {pkg.price_per_guest && <span>{pkg.price_per_guest} Birr / guest</span>}
            {pkg.price_per_guest && pkg.flat_price && <span> · </span>}
            {pkg.flat_price && <span>{pkg.flat_price} Birr flat</span>}
            {pkg.min_guests ? <span style={{ color: "#888", fontWeight: 400 }}> · Min {pkg.min_guests} guests</span> : null}
          </div>
        </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setEditing(true)} style={secondaryBtn}>Edit</button>
          <button onClick={handleDelete} disabled={deleting} style={{ ...secondaryBtn, color: "crimson", borderColor: "crimson" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2dccf", borderRadius: 8, padding: "1rem" };
const input: React.CSSProperties = { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc", width: "100%" };
const primaryBtn: React.CSSProperties = { background: "#4b3621", color: "#fff", border: "none", borderRadius: 4, padding: "0.5rem 1rem", cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "transparent", color: "#4b3621", border: "1px solid #4b3621", borderRadius: 4, padding: "0.4rem 0.75rem", cursor: "pointer" };
