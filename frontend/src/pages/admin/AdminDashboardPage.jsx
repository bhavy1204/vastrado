import { useEffect, useState } from "react";
import { Storefront, Users, CreditCard, Image } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api/index";
import Loader from "@/components/common/Loader";

/**
 * Admin DashboardPage — /admin/dashboard
 * Assumes this renders inside a layout that already places <AdminSidebar />
 * alongside an <Outlet /> — this file is page content only.
 *
 * NOTE: field names on the stats object (totalSellers, totalUsers,
 * activeSubscriptions, pendingBanners) are assumed — adjust to match
 * whatever getDashboardStats() actually returns.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    adminService
      .getDashboardStats()
      .then((res) => {
        if (!isCancelled) setStats(res.data?.data);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message || "Couldn't load dashboard stats",
        ),
      )
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return <Loader className="py-16" label="Loading dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8 p-5 sm:p-7">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="mt-2 text-sm text-text-muted">
          Welcome back. Here's an overview of your marketplace.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Storefront size={24} weight="duotone" />}
          label="Total Sellers"
          value={stats?.totalSellers ?? "—"}
        />

        <StatCard
          icon={<Users size={24} weight="duotone" />}
          label="Total Users"
          value={stats?.totalUsers ?? "—"}
        />

        <StatCard
          icon={<CreditCard size={24} weight="duotone" />}
          label="Active Subscriptions"
          value={stats?.activeSubscriptions ?? "—"}
        />

        <StatCard
          icon={<Image size={24} weight="duotone" />}
          label="Pending Banners"
          value={stats?.pendingBanners ?? "—"}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-border bg-surface-raised p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-3xl font-bold tracking-tight text-text">{value}</p>

        <p className="mt-2 text-sm text-text-muted">{label}</p>
      </div>
    </div>
  );
}
