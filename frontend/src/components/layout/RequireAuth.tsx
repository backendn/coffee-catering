import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Wraps protected admin routes. Renders the nested route via <Outlet />
// when authenticated, otherwise redirects to /login. This only guards the
// UI — the real enforcement is server-side (middleware.RequireAdmin on the
// Go backend); this just keeps logged-out users from seeing admin pages
// flash before an API call fails.
export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  console.log("RequireAuth fired, isAuthenticated =", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
