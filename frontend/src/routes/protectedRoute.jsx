import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

export default function ProtectedRoute({
  allowedActors = [],
  requireAdmin = false,
  requiredStaffRole = null,
  redirectTo = "/login",
}) {
  const actorType = useAuthStore((s) => s.actorType);
  const staff = useAuthStore((s) => s.staff);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  // Not logged in at all
  if (!actorType) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredStaffRole) {
    if (actorType !== "staff" || staff?.role !== requiredStaffRole) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
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
