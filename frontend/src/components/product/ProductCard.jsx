import { Link } from "react-router-dom";
import { Heart } from "@phosphor-icons/react";
import { formatPrice, formatDiscount } from "@/lib/formatters";

/**
 * ProductCard
 *   <ProductCard product={product} onToggleWishlist={handleToggle} isWishlisted={false} />
 *
 * Expects product shape from productService (getAll/search/getSellerProducts):
 *   { _id, slug, name, images[], price, discountedPrice, sellerName? }
 */
export default function ProductCard({ product, onToggleWishlist, isWishlisted = false }) {
  const {
    slug,
    productName,
    images,
    price,
    discountedPrice,
    averageRating,
  } = product;

  const hasDiscount = discountedPrice && discountedPrice < price;
  const thumbnail = images?.[0];

  return (
    <div className="group relative">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-3/4 rounded-md overflow-hidden bg-surface border border-border">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-text-muted text-xs">
              No image
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-2 left-2 rounded-full bg-primary text-text-on-primary text-xs font-semibold px-2 py-0.5">
              {formatDiscount(price, discountedPrice)}
            </span>
          )}

          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product);
              }}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-surface-raised/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
            >
              <Heart
                size={16}
                weight={isWishlisted ? "fill" : "regular"}
                className={
                  isWishlisted ? "text-primary" : "text-text-secondary"
                }
              />
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <p className="text-xs sm:text-sm text-text font-medium leading-snug line-clamp-2">
            {productName}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-sm sm:text-base font-semibold text-white bg-success rounded-md px-1.5 py-0.5">
                {formatPrice(hasDiscount ? discountedPrice : price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-text-muted line-through truncate">
                  {formatPrice(price)}
                </span>
              )}
            </div>

            {averageRating > 0 && (
              <span className="shrink-0 flex items-center gap-0.5 text-xs text-text-muted">
                <Star size={12} weight="fill" className="text-primary" />
                {averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

