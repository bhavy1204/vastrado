import { useEffect, useState, useCallback } from "react";
import { Heart } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService } from "@/api/index";
import usePagination from "@/hooks/usePagination";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";

/**
 * WishlistPage — /wishlist
 * Fetched per-page, no global Zustand store for wishlist state (per your
 * design decision to keep it lean) — this page owns its own local state.
 */
export default function WishlistPage() {
  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage } =
    usePagination();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(() => {
    setIsLoading(true);
    userService
      .getWishlist(params)
      .then((res) => {
        const items = res.data.data.items;
        // Items may come back either as raw products or { product } wrappers
        setProducts(items.map((item) => item.product || item));
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Couldn't load your wishlist"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (product) => {
    try {
      await userService.removeFromWishlist(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't remove this item");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <h1 className="text-lg font-bold text-text">Your wishlist</h1>

      <ProductGrid
        products={products}
        isLoading={isLoading}
        onToggleWishlist={handleRemove}
        wishlistedIds={products.map((p) => p._id)}
        emptyTitle="Your wishlist is empty"
        emptyDescription="Tap the heart icon on any product to save it here."
      />

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

