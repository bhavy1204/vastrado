import { useEffect, useState, useRef, useCallback } from "react";
import {
  Image,
  CheckCircle,
  XCircle,
  Trash,
  Plus,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { siteContentService } from "@/api/index";
import { validateImageFile } from "@/lib/formatters";
import usePagination from "@/hooks/usePagination.js";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { SelectionForeground } from "@phosphor-icons/react/dist/ssr";

/**
 * Admin BannersPage — /admin/banners
 * Shows both admin-created banners and seller-submitted requests
 * (differentiated by `status`: pending | approved | rejected).
 * Reordering uses simple up/down controls rather than drag-and-drop
 * for simplicity — swap for a dnd library later if you want that UX.
 */
export default function AdminBannersPage() {
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
  } = usePagination();

  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchBanners = useCallback(() => {
    setIsLoading(true);
    siteContentService
      .adminGetAllBanners(params)
      .then((res) => {
        const bannersPayload = res.data?.banners ?? res.data?.data ?? res.data;
        setBanners(Array.isArray(bannersPayload) ? bannersPayload : []);

        const totalPages = res.data.data.pagination.totalPages
        setTotalPages(typeof totalPages === "number" ? totalPages : 1);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load banners"),
      )
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleApprove = async (banner) => {
    setActioningId(banner._id);
    try {
      await siteContentService.approveBanner(banner._id, {
        status: "approved",
      });
      toast.success("Banner approved");
      fetchBanners();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't approve this banner",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (banner) => {
    setActioningId(banner._id);
    try {
      await siteContentService.rejectBanner(banner._id);
      toast.success("Banner rejected");
      fetchBanners();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't reject this banner",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm("Delete this banner permanently?")) return;
    setActioningId(banner._id);
    try {
      await siteContentService.deleteBanner(banner._id);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't delete this banner",
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleReorder = async (banner, direction) => {
    const index = banners.findIndex((b) => b._id === banner._id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const reordered = [...banners];
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];
    setBanners(reordered);

    try {
      await siteContentService.updateBannerOrder({
        order: reordered.map((b, i) => ({ id: b._id, position: i })),
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't save the new order",
      );
      fetchBanners();
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-bold text-text">Banners</h1>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} weight="bold" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Add banner
        </Button>
      </div>

      {isLoading ? (
        <Loader className="py-16" label="Loading banners..." />
      ) : banners.length === 0 ? (
        <EmptyState
          icon={<Image size={26} weight="duotone" />}
          title="No banners yet"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="flex items-center gap-3 p-3 rounded-md border border-border bg-surface-raised"
            >
              <div className="h-16 w-28 rounded-md overflow-hidden bg-surface shrink-0">
                {banner.image && (
                  <img
                    src={banner.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {banner.title || "Untitled banner"}
                </p>
                <StatusPill status={banner.status} />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleReorder(banner, "up")}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="text-text-muted hover:text-text disabled:opacity-30 p-1.5"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(banner, "down")}
                  disabled={index === banners.length - 1}
                  aria-label="Move down"
                  className="text-text-muted hover:text-text disabled:opacity-30 p-1.5"
                >
                  <ArrowDown size={15} />
                </button>

                {banner.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(banner)}
                      disabled={actioningId === banner._id}
                      aria-label="Approve"
                      className="text-success p-1.5 disabled:opacity-50"
                    >
                      <CheckCircle size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(banner)}
                      disabled={actioningId === banner._id}
                      aria-label="Reject"
                      className="text-error p-1.5 disabled:opacity-50"
                    >
                      <XCircle size={17} />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(banner)}
                  disabled={actioningId === banner._id}
                  aria-label="Delete"
                  className="text-text-muted hover:text-error p-1.5 disabled:opacity-50"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
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

      <CreateBannerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          fetchBanners();
        }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  const config =
    {
      approved: "bg-success-bg text-success border-success-border",
      pending: "bg-warning-bg text-warning border-warning-border",
      rejected: "bg-error-bg text-error border-error-border",
    }[status] || "bg-surface text-text-muted border-border";

  return (
    <span
      className={`inline-block mt-1 text-xs font-medium rounded-full border px-2 py-0.5 ${config}`}
    >
      {status || "unknown"}
    </span>
  );
}

const EXPIRY_DAYS_OPTIONS = [1, 3, 10, 15, 30, 45, 60, 90];

function CreateBannerModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [scope, setScope] = useState("GLOBAL");
  const [cityId, setCityId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [isSponsored, setIsSponsored] = useState(false);
  const [order, setOrder] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);


  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const errorMessage = validateImageFile(selected, 5);
    if (errorMessage) {
      toast.error(errorMessage);
      e.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setTitle("");
    setDescription("");
    setRedirectUrl("");
    setScope("GLOBAL");
    setCityId("");
    setSellerId("");
    setIsSponsored(false);
    setOrder("");
    setExpiryDays("");
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please choose a banner image");
      return;
    }
    if (scope === "CITY" && !cityId) {
      toast.error("City ID is required for a city banner");
      return;
    }
    if (scope === "SELLER" && !sellerId) {
      toast.error("Seller ID is required for a seller banner");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("redirectUrl", redirectUrl);
      formData.append("scope", scope);
      if (scope === "CITY") formData.append("cityId", cityId);
      if (scope === "SELLER") formData.append("sellerId", sellerId);
      formData.append("isSponsored", isSponsored);
      if (order) formData.append("order", order);
      if (expiryDays) formData.append("expiryDays", expiryDays);
      formData.append("banner", file);

      await siteContentService.adminCreateBanner(formData);
      toast.success("Banner added");
      resetForm();
      onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't add this banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add banner" size="sm">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-surface-raised text-sm text-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Redirect URL (optional)
          </label>
          <input
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="https://..."
            className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Scope
          </label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="GLOBAL">Global</option>
            <option value="CITY">City</option>
            <option value="SELLER">Seller</option>
          </select>
        </div>

        {scope === "CITY" && (
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              City ID
            </label>
            <input
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        )}

        {scope === "SELLER" && (
          <div>
            <label className="text-sm font-medium text-text block mb-1.5">
              Seller ID
            </label>
            <input
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="isSponsored"
            type="checkbox"
            checked={isSponsored}
            onChange={(e) => setIsSponsored(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="isSponsored" className="text-sm font-medium text-text">
            Sponsored
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Order (optional)
          </label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Expires in (optional)
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-surface-raised text-sm text-text px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">No expiry</option>
            {EXPIRY_DAYS_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? "day" : "days"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-text block mb-1.5">
            Image
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Banner preview"
              className="mt-2 w-full h-32 object-cover rounded-md border border-border"
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Add banner
          </Button>
        </div>
      </div>
    </Modal>
  );
}
