import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { sellerService } from "@/api";
import { sellerProfileUpdateSchema } from "@/lib/validators";
import { validateImageFile } from "@/lib/formatters";
import useAuthStore from "@/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import { productService } from "@/api";
import ShopHeader from "@/components/seller/ShopHeader";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * Seller ProfilePage — /seller/profile
 * The seller's own IG/LinkedIn-style shop page, with edit affordances.
 * Adding a product opens the same modal flow as ProductsPage — since
 * there's no dedicated product-create page, this just points sellers there
 * to avoid duplicating the form modal in two places.
 */
export default function SellerProfilePage() {
  const navigate = useNavigate();
  const { seller, updateSellerState } = useAuthStore();
  const [activeModal, setActiveModal] = useState(null); // "avatar" | "banner" | "description" | null

  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage } =
    usePagination();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchProducts = useCallback(() => {
    setIsLoadingProducts(true);
    productService
      .getMyProducts(params)
      .then((res) => {
        setProducts(res.data?.products || res.data || []);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!seller) return null;

  return (
    <div className="flex flex-col">
      <ShopHeader
        seller={seller}
        isOwner
        onEditBanner={() => setActiveModal("banner")}
        onEditAvatar={() => setActiveModal("avatar")}
        onEditDescription={() => setActiveModal("description")}
        onOpenLocation={() => setActiveModal("location")}
        onAddProduct={() => navigate("/seller/products")}
      />

      <div className="px-4 sm:px-6 py-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Your products
        </h2>
        <ProductGrid products={products} isLoading={isLoadingProducts} emptyTitle="No products yet" emptyDescription="Add products from the Manage Products page." />
        <div className="mt-6">
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
      </div>

      <AvatarBannerModal
        type="avatar"
        isOpen={activeModal === "avatar"}
        onClose={() => setActiveModal(null)}
        onSaved={(url) => updateSellerState({ avatar: url })}
      />
      <AvatarBannerModal
        type="banner"
        isOpen={activeModal === "banner"}
        onClose={() => setActiveModal(null)}
        onSaved={(url) => updateSellerState({ banner: url })}
      />
      <DescriptionModal
        isOpen={activeModal === "description"}
        onClose={() => setActiveModal(null)}
        seller={seller}
        onSaved={(fields) => updateSellerState(fields)}
      />
    </div>
  );
}


function AvatarBannerModal({ type, isOpen, onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAvatar = type === "avatar";

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const validation = validateImageFile(selected, 5);
    if (!validation?.isValid) {
      toast.error(validation?.message || "Please choose a valid image, under 5MB");
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(type, file);
      const res = isAvatar
        ? await sellerService.updateAvatar(formData)
        : await sellerService.updateBanner(formData);
      const url = res.data?.[type] || res.data?.url;
      toast.success(`${isAvatar ? "Avatar" : "Banner"} updated`);
      onSaved(url);
      setFile(null);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAvatar ? "Update avatar" : "Update banner"} size="sm">
      <div className="flex flex-col gap-4">
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={isSubmitting} disabled={!file} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DescriptionModal({ isOpen, onClose, seller, onSaved }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerProfileUpdateSchema),
    defaultValues: { description: seller?.description || "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await sellerService.updateProfile(data);
      toast.success("Description updated");
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update description");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit description" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <textarea
            rows={4}
            className="w-full rounded-md border border-border bg-surface-raised text-sm text-text p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

