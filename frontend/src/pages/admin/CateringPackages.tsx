import { useEffect, useState, type FormEvent } from "react";
import { listCateringPackages, createCateringPackageAdmin } from "../../api/catering";
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
        <NewPackageForm
          onCreated={() => {
            setShowNew(false);
            load();
          }}
          onError={setError}
        />
      )}

      {loading ? (
        <p>Loading packages…</p>
      ) : packages.length === 0 ? (
        <p>No catering packages yet — add your first one above.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          {packages.map((p) => (
            <div key={p.id} style={card}>
              <strong>{p.name}</strong>
              {p.description && <p style={{ color: "#666", fontSize: "0.9rem" }}>{p.description}</p>}
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                {p.price_per_guest && <div>{p.price_per_guest} Birr / guest</div>}
                {p.flat_price && <div>{p.flat_price} Birr flat</div>}
                {p.min_guests ? <div style={{ color: "#888" }}>Min {p.min_guests} guests</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewPackageForm({ onCreated, onError }: { onCreated: () => void; onError: (e: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerGuest, setPricePerGuest] = useState("");
  const [flatPrice, setFlatPrice] = useState("");
  const [minGuests, setMinGuests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCateringPackageAdmin({
        name,
        description: description || undefined,
        price_per_guest: pricePerGuest || undefined,
        flat_price: flatPrice || undefined,
        min_guests: minGuests ? Number(minGuests) : undefined,
      });
      setName("");
      setDescription("");
      setPricePerGuest("");
      setFlatPrice("");
      setMinGuests("");
      onCreated();
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...card, display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem", maxWidth: 420 }}>
      <strong>New Package</strong>
      <input required placeholder="Name (e.g. Coffee Bar for 50)" value={name} onChange={(e) => setName(e.target.value)} style={input} />
      <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={input} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input placeholder="Price per guest" value={pricePerGuest} onChange={(e) => setPricePerGuest(e.target.value)} style={input} />
        <input placeholder="Flat price" value={flatPrice} onChange={(e) => setFlatPrice(e.target.value)} style={input} />
      </div>
      <input placeholder="Min guests (optional)" type="number" value={minGuests} onChange={(e) => setMinGuests(e.target.value)} style={input} />
      <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Set either price per guest or a flat price (or both, if it varies).</p>
      <button type="submit" disabled={submitting} style={primaryBtn}>
        {submitting ? "Creating…" : "Create Package"}
      </button>
    </form>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2dccf", borderRadius: 8, padding: "1rem" };
const input: React.CSSProperties = { padding: "0.5rem", borderRadius: 4, border: "1px solid #ccc" };
const primaryBtn: React.CSSProperties = { background: "#4b3621", color: "#fff", border: "none", borderRadius: 4, padding: "0.5rem 1rem", cursor: "pointer" };
