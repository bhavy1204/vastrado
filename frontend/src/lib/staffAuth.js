import staffService from "@/api/services/staff.js";
import useAuthStore from "@/store/useAuthStore";

const STAFF_DASHBOARD_PATHS = {
  "city-admin": "/city-admin/dashboard",
  "delivery-agent": "/delivery/dashboard",
  "support-team": "/support/dashboard",
};

export function getStaffDashboardPath(role) {
  return STAFF_DASHBOARD_PATHS[role] ?? "/staff/login";
}

export async function staffLogout(navigate) {
  try {
    await staffService.logout();
  } catch {
    // clearAuth runs regardless — cookie may already be expired
  } finally {
    console.log("clearAuth called");
    useAuthStore.getState().clearAuth();

    if (navigate) {
      navigate("/staff/login", { replace: true });
    } else {
      window.location.href = "/staff/login";
    }
  }
}
