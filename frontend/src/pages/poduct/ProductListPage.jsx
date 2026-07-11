import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { productService, userService } from "@/api";
import usePagination from "@/hooks/usePagination";
import useAuthStore from "@/store/useAuthStore";
import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";

/**
 * ProductListPage — /products
 * Filters (gender, type, sort) are synced to the URL query string so
 * listing pages are shareable/bookmarkable. Uses productService.getAll
 * with the combined filter + pagination params.
 */
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { actorType } = useAuthStore();

  const filters = {
    gender: searchParams.get("gender") || undefined,
    type: searchParams.get("type") || undefined,
    sort: searchParams.get("sort") || undefined,
  };

  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage, resetPage } =
    usePagination();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    productService
      .getAll({ ...params, ...filters })
      .then((res) => {
        setProducts(res.data?.products || res.data || []);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Couldn't load products"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.gender, filters.type, filters.sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (actorType !== "user") return;
    userService
      .getWishlist()
      .then((res) => {
        const items = res.data?.items || res.data || [];
        setWishlistedIds(items.map((p) => p._id || p.product?._id));
      })
      .catch(() => {});
  }, [actorType]);

  const handleFilterChange = (nextFilters) => {
    const next = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    setSearchParams(next);
    resetPage();
  };

  const handleResetFilters = () => {
    setSearchParams({});
    resetPage();
  };

  const handleToggleWishlist = async (product) => {
    if (actorType !== "user") {
      toast.error("Log in to save items to your wishlist");
      return;
    }
    const isWishlisted = wishlistedIds.includes(product._id);
    try {
      if (isWishlisted) {
        await userService.removeFromWishlist(product._id);
        setWishlistedIds((prev) => prev.filter((id) => id !== product._id));
      } else {
        await userService.addToWishlist(product._id);
        setWishlistedIds((prev) => [...prev, product._id]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update your wishlist");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <h1 className="text-lg font-bold text-text">All products</h1>

      <ProductFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

      <ProductGrid
        products={products}
        isLoading={isLoading}
        onToggleWishlist={handleToggleWishlist}
        wishlistedIds={wishlistedIds}
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

