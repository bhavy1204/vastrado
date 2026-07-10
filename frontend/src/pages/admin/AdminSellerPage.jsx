import { useEffect, useState, useCallback } from "react";
import { Storefront, CheckCircle, Prohibit } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { adminService } from "@/api";
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
  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage, resetPage } =
    usePagination();

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
        setSellers(res.data?.sellers || res.data || []);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Couldn't load sellers"))
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
      toast.error(err?.response?.data?.message || "Couldn't approve this seller");
    } finally {
      setActioningId(null);
    }
  };

  const handleSuspend = async (seller) => {
    if (!window.confirm(`Suspend ${seller.shopName}? Their shop will be hidden from customers.`)) return;
    setActioningId(seller._id);
    try {
      await adminService.suspendSeller(seller._id);
      toast.success(`${seller.shopName} suspended`);
      fetchSellers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't suspend this seller");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-text">Sellers</h1>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by shop name or email..."
          className="h-9 w-64 max-w-full rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading sellers..." />
      ) : sellers.length === 0 ? (
        <EmptyState icon={<Storefront size={26} weight="duotone" />} title="No sellers found" />
      ) : (
        <div className="rounded-md border border-border bg-surface-raised overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscription</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller._id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-text">{seller.shopName}</td>
                  <td className="px-4 py-3 text-text-secondary">{seller.email}</td>
                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={seller.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(seller.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {seller.isApproved ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Prohibit size={14} />}
                          isLoading={actioningId === seller._id}
                          onClick={() => handleSuspend(seller)}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle size={14} />}
                          isLoading={actioningId === seller._id}
                          onClick={() => handleApprove(seller)}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
