import { NavLink } from "react-router-dom";
import {
  SquaresFour,
  Package,
  Storefront,
  CreditCard,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { to: "/seller/dashboard", label: "Dashboard", icon: SquaresFour, end: true },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/profile", label: "My shop", icon: Storefront },
  { to: "/seller/subscription", label: "Subscription", icon: CreditCard },
];

export default function SellerSidebar() {
  return (
    <aside className="w-full sm:w-56 shrink-0 border-r border-border bg-surface-raised sm:h-[calc(100vh-4rem)] sm:sticky sm:top-16">
      <nav className="flex sm:flex-col gap-1 p-3 overflow-x-auto sm:overflow-visible">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary-subtle text-primary-text"
                  : "text-text-secondary hover:bg-surface",
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

