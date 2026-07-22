import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { getStaffDashboardPath } from "@/lib/staffAuth";

export default function PublicRoute({
  redirectTo = "/",
  actorType = null,
}) {
  const currentActor = useAuthStore((s) => s.actorType);
  const staff = useAuthStore((s) => s.staff);

  const shouldRedirect = actorType
    ? currentActor === actorType
    : !!currentActor;

  if (shouldRedirect) {
    const destination =
      actorType === "staff" && staff?.role
        ? getStaffDashboardPath(staff.role)
        : redirectTo;

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
