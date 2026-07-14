import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { productService, userService } from "@/api/index";
import useDebounce from "@/hooks/useDebounce";
import usePagination from "@/hooks/usePagination";
import useAuthStore from "@/store/useAuthStore";
import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/common/Pagination";

/**
 * SearchResultsPage — /search?q=...
 * Query input is debounced locally, then synced into the URL so results
 * stay shareable/bookmarkable, same pattern as ProductListPage.
 */
export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { actorType } = useAuthStore();

  const [queryInput, setQueryInput] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(queryInput, 400);

  const filters = {
    gender: searchParams.get("gender") || undefined,
    type: searchParams.get("type") || undefined,
    sort: searchParams.get("sort") || undefined,
  };

  const { page, limit, params, totalPages, setTotalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage, resetPage } =
    usePagination();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  // Push the debounced query into the URL, replacing so it doesn't spam history
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set("q", debouncedQuery);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const activeQuery = searchParams.get("q");

  const fetchResults = useCallback(() => {
    if (!activeQuery) {
      setProducts([]);
      setTotalPages(1);
      return;
    }
    setIsLoading(true);
    productService
      .search({ q: activeQuery, ...params, ...filters })
      .then((res) => {
        setProducts(res.data?.data.products);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Search failed"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, page, limit, filters.gender, filters.type, filters.sort]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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
    const next = new URLSearchParams(searchParams);
    ["gender", "type", "sort"].forEach((key) => next.delete(key));
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    setSearchParams(next);
    resetPage();
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    if (activeQuery) next.set("q", activeQuery);
    setSearchParams(next);
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
      <div className="relative max-w-md">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          autoFocus
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search products, shops..."
          className="w-full h-11 pl-9 pr-3 rounded-md bg-surface-raised border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {activeQuery && (
        <>
          <ProductFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

          <ProductGrid
            products={products}
            isLoading={isLoading}
            onToggleWishlist={handleToggleWishlist}
            wishlistedIds={wishlistedIds}
            emptyTitle={`No results for "${activeQuery}"`}
            emptyDescription="Try a different search term or browse all products instead."
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
        </>
      )}
    </div>
  );
}

