import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, Star, ArrowRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { sellerService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import Loader from "@/components/common/Loader";
import SubscriptionStatusBadge from "@/components/seller/SubscriptionStatusBadge";

/**
 * Seller DashboardPage — /seller/dashboard
 * Assumes this renders inside a layout that already places <SellerSidebar />
 * alongside an <Outlet /> (not yet built as a standalone component) —
 * this file is page content only.
 */
export default function SellerDashboardPage() {
  const { seller } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    sellerService
      .getDashboard()
      .then((res) => {
        if (!isCancelled) setStats(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Couldn't load dashboard data");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return <Loader className="py-16" label="Loading your dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-text">
            Welcome back, {seller?.shopName || "there"}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Here's how your shop is doing</p>
        </div>
        {seller?.subscriptionStatus && <SubscriptionStatusBadge status={seller.subscriptionStatus} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Package size={18} />} label="Active products" value={stats?.productCount ?? "—"} />
        <StatCard icon={<Eye size={18} />} label="Profile views" value={stats?.profileViews ?? "—"} />
        <StatCard
          icon={<Star size={18} />}
          label="Average rating"
          value={stats?.averageRating ? stats.averageRating.toFixed(1) : "—"}
        />
      </div>

      {seller?.subscriptionStatus !== "active" && (
        <div className="rounded-md border border-warning-border bg-warning-bg px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-warning">
            Your subscription isn't active — your shop won't appear in customer search results.
          </p>
          <Link
            to="/seller/subscription"
            className="text-sm font-medium text-warning inline-flex items-center gap-1 hover:underline shrink-0"
          >
            Fix this <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction to="/seller/products" title="Manage products" description="Add, edit, or hide items in your catalog" />
        <QuickAction to="/seller/profile" title="Edit shop profile" description="Update your banner, avatar, and description" />
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

function QuickAction({ to, title, description }) {
  return (
    <Link
      to={to}
      className="rounded-md border border-border bg-surface-raised p-4 flex items-center justify-between hover:border-border-strong transition-colors"
    >
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <ArrowRight size={16} className="text-text-muted shrink-0" />
    </Link>
  );
}

