import { useEffect, useState, useCallback, useMemo } from "react";
import { Storefront } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { cityAdminService } from "@/api/index";
import useCityStore from "@/store/useCityStore";
import usePagination from "@/hooks/usePagination";
import { formatDate } from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

const STATUS_COLORS = {
  approved: "bg-green-500/10 text-green-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  suspended: "bg-red-500/10 text-red-600",
};

export default function CityAdminSellersPage() {
  const selectedCity = useCityStore((s) => s.selectedCity);
  const {
    page,
    limit,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination();

  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchSellers = useCallback(() => {
    setIsLoading(true);
    cityAdminService
      .getCitySellers()
      .then((res) => setSellers(res.data?.data ?? []))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load sellers"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(sellers.length / limit)));
  }, [sellers.length, limit, setTotalPages]);

  const paginatedSellers = useMemo(() => {
    const start = (page - 1) * limit;
    return sellers.slice(start, start + limit);
  }, [sellers, page, limit]);

  const cityLabel = selectedCity?.name ?? "—";

  const handleApprove = async (seller) => {
    setActioningId(seller._id);
    try {
      await cityAdminService.approveSeller(seller._id);
      toast.success(`${seller.shopName} approved`);
      fetchSellers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't approve this seller",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleSuspend = async (seller) => {
    if (
      !window.confirm(
        `Suspend ${seller.shopName}? Their shop will be hidden from customers.`,
      )
    )
      return;
    setActioningId(seller._id);
    try {
      await cityAdminService.suspendSeller(seller._id);
      toast.success(`${seller.shopName} suspended`);
      fetchSellers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't suspend this seller",
      );
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-7">
      <div>
        <h1 className="text-2xl font-bold text-text">Sellers</h1>
        <p className="mt-1 text-sm text-text-muted">
          Review and manage seller accounts in your city.
        </p>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading sellers..." />
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={<Storefront size={30} weight="duotone" />}
          title="No sellers found"
        />
      ) : (
        <div className="grid gap-5">
          {paginatedSellers.map((seller) => (
            <div
              key={seller._id}
              className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                    {seller.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.shopName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                        {seller.shopName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h2 className="text-lg font-semibold text-text">
                        {seller.shopName}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {seller.fullName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span>{seller.phone}</span>
                      <span className="capitalize text-text-muted">
                        {cityLabel}
                      </span>
                    </div>

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        STATUS_COLORS[seller.status] || "bg-border text-text"
                      }`}
                    >
                      {seller.status}
                    </span>

                    <p className="text-sm text-text-muted">
                      Joined {formatDate(seller.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 w-full lg:w-56">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Seller Status
                  </label>
                  <select
                    value={seller.status}
                    disabled={actioningId === seller._id}
                    onChange={(e) => {
                      const status = e.target.value;
                      if (status === seller.status) return;
                      if (status === "approved") handleApprove(seller);
                      else if (status === "suspended") handleSuspend(seller);
                    }}
                    className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  {actioningId === seller._id && (
                    <p className="text-xs text-text-muted">Updating seller...</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && sellers.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onNext={nextPage}
          onPrev={prevPage}
          onGoTo={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}
    </div>
  );
}
