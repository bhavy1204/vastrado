import { NavLink, useNavigate } from "react-router-dom";
import { SquaresFour, Storefront, Users, SignOut } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { staffLogout } from "@/lib/staffAuth";

const NAV_ITEMS = [
  {
    to: "/city-admin/dashboard",
    label: "Dashboard",
    icon: SquaresFour,
    end: true,
  },
  { to: "/city-admin/sellers", label: "Sellers", icon: Storefront },
  { to: "/city-admin/staff", label: "Staff", icon: Users },
];

export default function CityAdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await staffLogout(navigate);
    toast.success("Logged out");
  };

  return (
    <aside className="w-full sm:w-64 shrink-0 border-r border-border bg-bg sm:h-[calc(100vh-4rem)] sm:sticky sm:top-16">
      <div className="hidden sm:flex flex-col h-full p-5">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text">City Admin</h2>
          <p className="mt-1 text-sm text-text-muted">City Control Center</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-raised p-3">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Navigation
          </p>

          <nav className="space-y-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-primary text-text-on-primary shadow-md"
                      : "text-text-secondary hover:bg-surface hover:text-text",
                  ].join(" ")
                }
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 group-[.active]:bg-white/20">
                  <Icon size={20} weight="duotone" />
                </div>
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-xl border border-border bg-surface-raised p-4">
          <p className="text-sm font-medium text-text">ClothMarket City Admin</p>
          <p className="mt-1 text-xs text-text-muted">
            Manage sellers and staff in your city.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-surface"
          >
            <SignOut size={18} />
            Log out
          </button>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-3 sm:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 rounded-xl px-4 py-2.5 whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary text-text-on-primary"
                  : "bg-surface-raised text-text-secondary",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
