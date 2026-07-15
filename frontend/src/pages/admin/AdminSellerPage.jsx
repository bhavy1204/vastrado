import { useEffect, useState, useCallback } from "react";
import { Storefront, CheckCircle, Prohibit } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api/index";
import usePagination from "@/hooks/usePagination";
import useDebounce from "@/hooks/useDebounce";
import { formatDate } from "@/lib/formatters";
import SubscriptionStatusBadge from "@/components/seller/SubscriptionStatusBadge";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";

/**
 * Admin SellersPage — /admin/sellers
 * NOTE: assumes getAllSellers(params) accepts a `search` param and returns
 * { sellers, totalPages } — adjust if your controller's response shape
 * or accepted query params differ.
 */
export default function AdminSellersPage() {
  const {
    page,
    limit,
    params,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    resetPage,
  } = usePagination();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchSellers = useCallback(() => {
    setIsLoading(true);
    adminService
      .getAllSellers({ ...params, search: debouncedSearch || undefined })
      .then((res) => {
        setSellers(res.data.data.sellers);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load sellers"),
      )
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleApprove = async (seller) => {
    setActioningId(seller._id);
    try {
      await adminService.approveSeller(seller._id);
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
      await adminService.suspendSeller(seller._id);
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
    <div className="flex flex-col gap-6 p-12 sm:p-7 ">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Seller Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Review, approve and manage seller accounts.
          </p>
        </div>

        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by shop name or email..."
          className="h-11 w-full md:w-80 rounded-lg border border-border bg-surface-raised px-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading sellers..." />
      ) : sellers.length === 0 ? (
        <EmptyState
          icon={<Storefront size={30} weight="duotone" />}
          title="No sellers found"
        />
      ) : (
        <div className="grid gap-5 p-5">
          {sellers.map((seller) => {
            const statusColors = {
              approved: "bg-green-500/10 text-green-600",
              pending: "bg-yellow-500/10 text-yellow-600",
              suspended: "bg-red-500/10 text-red-600",
            };

            return (
              <div
                key={seller._id}
                className="rounded-xl border border-border bg-surface-raised p-6 transition-all hover:border-primary/25 hover:shadow-md mt-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between ">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                      <img
                        src={seller.avatar}
                        alt={seller.shopName}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h2 className="text-lg font-semibold text-text">
                          {seller.shopName}
                        </h2>

                        <p className="text-sm text-text-secondary">
                          {seller.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <SubscriptionStatusBadge
                          status={seller.subscriptionStatus}
                        />

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusColors[seller.status] || "bg-border text-text"
                          }`}
                        >
                          {seller.status}
                        </span>
                      </div>

                      <p className="text-sm text-text-muted">
                        Joined {formatDate(seller.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
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

                        if (status === "approved") {
                          handleApprove(seller);
                        } else if (status === "suspended") {
                          handleSuspend(seller);
                        }
                        // pending endpoint can be added later
                      }}
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    {actioningId === seller._id && (
                      <p className="text-xs text-text-muted">
                        Updating seller...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={nextPage}
        onPrev={prevPage}
        onGoTo={goToPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
