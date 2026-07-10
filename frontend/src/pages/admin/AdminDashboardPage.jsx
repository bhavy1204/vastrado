import { useEffect, useState } from "react";
import { Storefront, Users, CreditCard, Image } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api";
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
        if (!isCancelled) setStats(res.data);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Couldn't load dashboard stats"))
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
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-lg font-bold text-text">Admin dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Storefront size={18} />} label="Total sellers" value={stats?.totalSellers ?? "—"} />
        <StatCard icon={<Users size={18} />} label="Total users" value={stats?.totalUsers ?? "—"} />
        <StatCard icon={<CreditCard size={18} />} label="Active subscriptions" value={stats?.activeSubscriptions ?? "—"} />
        <StatCard icon={<Image size={18} />} label="Pending banners" value={stats?.pendingBanners ?? "—"} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-md border border-border bg-surface-raised p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-text leading-none">{value}</p>
        <p className="text-xs text-text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}

