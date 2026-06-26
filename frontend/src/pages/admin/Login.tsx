import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0e8" }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", padding: "2rem", borderRadius: 8, width: 320, display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Admin Login</h1>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
          Username
          <input required value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.9rem" }}>
          Password
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <p style={{ color: "crimson", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ background: "#4b3621", color: "#fff", border: "none", borderRadius: 6, padding: "0.75rem", fontWeight: 600, cursor: "pointer" }}
        >
          {submitting ? "Logging in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
