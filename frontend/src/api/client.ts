import axios from "axios";

// VITE_API_BASE_URL is set in docker-compose.yml (http://localhost:8080/api/v1).
// Falling back to a sane local default so `npm run dev` outside Docker still works.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attaches the admin JWT (if present) to every request. Public storefront
// requests simply won't have a token in localStorage, so this is a no-op
// for them — same client is safe to use for both public and admin calls.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes API error responses into a single readable message, since the
// backend's error envelope is {"code": ..., "message": ...} (see
// internal/pkg/response/response.go) rather than axios's default shape.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.message) return err.message;
  }
  return "Something went wrong. Please try again.";
}// VITE_API_BASE_URL injected at build time
