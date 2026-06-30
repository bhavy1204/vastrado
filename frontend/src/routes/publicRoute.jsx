import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

export default function PublicRoute({
  redirectTo = "/",
  actorType = null,
}) {
  const currentActor = useAuthStore((s) => s.actorType);

  const shouldRedirect = actorType
    ? currentActor === actorType
    : !!currentActor;

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
