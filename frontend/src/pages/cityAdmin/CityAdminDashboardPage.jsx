import { useEffect, useState } from "react";
import { Storefront, Users, CheckCircle, Clock } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { cityAdminService } from "@/api/index";
import useCityStore from "@/store/useCityStore";
import Loader from "@/components/common/Loader";

export default function CityAdminDashboardPage() {
  const selectedCity = useCityStore((s) => s.selectedCity);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      cityAdminService.getCitySellers(),
      cityAdminService.getCityStaff(),
    ])
      .then(([sellersRes, staffRes]) => {
        if (isCancelled) return;

        const sellers = sellersRes.data?.data ?? [];
        const staff = staffRes.data?.data ?? [];

        setStats({
          totalSellers: sellers.length,
          pendingSellers: sellers.filter((s) => s.status === "pending").length,
          approvedSellers: sellers.filter((s) => s.status === "approved").length,
          totalStaff: staff.length,
        });
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
          Overview for{" "}
          <span className="capitalize font-medium text-text">
            {selectedCity?.name ?? "your city"}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Storefront size={24} weight="duotone" />}
          label="Total Sellers"
          value={stats?.totalSellers ?? "—"}
        />
        <StatCard
          icon={<Clock size={24} weight="duotone" />}
          label="Pending Sellers"
          value={stats?.pendingSellers ?? "—"}
        />
        <StatCard
          icon={<CheckCircle size={24} weight="duotone" />}
          label="Approved Sellers"
          value={stats?.approvedSellers ?? "—"}
        />
        <StatCard
          icon={<Users size={24} weight="duotone" />}
          label="Total Staff"
          value={stats?.totalStaff ?? "—"}
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
