import { MagnifyingGlass } from "@phosphor-icons/react";
import ProductCard from "./ProductCard";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

/**
 * ProductGrid
 *   <ProductGrid products={products} isLoading={isLoading} onToggleWishlist={fn} wishlistedIds={ids} />
 */
export default function ProductGrid({
  products,
  isLoading = false,
  onToggleWishlist,
  wishlistedIds = [],
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or check back later.",
}) {
  if (isLoading) {
    return <Loader className="py-16" label="Loading products..." />;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <EmptyState
        icon={<MagnifyingGlass size={26} weight="duotone" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistedIds.includes(product._id)}
        />
      ))}
    </div>
  );
}


