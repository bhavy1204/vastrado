import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

export default function ProtectedRoute({
  allowedActors = [],
  requireAdmin = false,
  redirectTo = "/login",
}) {
  const actorType = useAuthStore((s) => s.actorType);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  // Not logged in at all
  if (!actorType) {
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in but wrong actor typ
  if (!allowedActors.includes(actorType)) {
    const fallback =
      actorType === "seller"
        ? "/seller/dashboard"
        : actorType === "staff"
          ? "/city-admin/dashboard"
          : "/";
    return <Navigate to={fallback} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
