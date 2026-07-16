import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sellerService, productService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import ShopHeader from "@/components/seller/ShopHeader";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";
import Modal from "@/components/common/Modal";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { Storefront, MapPin } from "@phosphor-icons/react";

/**
 * ShopPage — public view at /shop/:slug
 * If the logged-in seller happens to be viewing their own shop, this
 * defers entirely to the same edit-affordance path as ProfilePage
 * (isOwner=true), matching the "seller sees same public site" decision.
 */
export default function ShopPage() {
  const { slug } = useParams();
  const { actorType, seller: loggedInSeller } = useAuthStore();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingSeller, setIsLoadingSeller] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const {
    page,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination();

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingSeller(true);
    setNotFound(false);

    sellerService
      .getSellerPublicProfile(slug)
      .then((res) => {
        if (isCancelled) return;

        const data = res.data.data;

        setSeller(data.seller);
        setProducts(data.products ?? []);
        setTotalPages(1);
      })
      .catch((err) => {
        if (isCancelled) return;

        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(
            err?.response?.data?.message || "Couldn't load this shop",
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingSeller(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug, setTotalPages]);

  const isOwner = actorType === "seller" && loggedInSeller?.slug === slug;

  if (isLoadingSeller) {
    return <Loader className="py-24" label="Loading shop..." />;
  }

  if (notFound || !seller) {
    return (
      <EmptyState
        className="py-24"
        icon={<Storefront size={26} weight="duotone" />}
        title="Shop not found"
        description="This shop may have been removed or the link is incorrect."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <ShopHeader
        seller={isOwner ? loggedInSeller : seller}
        isOwner={isOwner}
        onOpenLocation={() => setIsLocationOpen(true)}
      />

      <div className="px-4 sm:px-6 py-6">
        <ProductGrid
          products={products}
          isLoading={isLoadingSeller}
          emptyTitle="No products listed yet"
          emptyDescription="This shop hasn't added any products yet — check back soon."
        />

        {totalPages > 1 && (
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
        )}
      </div>

      <Modal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        title="Shop location"
        size="md"
      >
        {seller.location?.coordinates ? (
          <iframe
            title="Shop location"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: 8 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              seller.location.coordinates[0] - 0.01
            }%2C${seller.location.coordinates[1] - 0.01}%2C${
              seller.location.coordinates[0] + 0.01
            }%2C${seller.location.coordinates[1] + 0.01}&marker=${
              seller.location.coordinates[1]
            }%2C${seller.location.coordinates[0]}`}
          />
        ) : (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <MapPin size={16} />
            Location not available for this shop.
          </p>
        )}
      </Modal>
    </div>
  );
}

