import { Link } from "react-router-dom";
import { MapPin, Star } from "@phosphor-icons/react";

/**
 * SellerCard
 *   <SellerCard seller={seller} />
 *
 * Expects shape from sellerService.getNearbySellers:
 *   { _id, slug, shopName, avatar, averageRating, numReviews, distanceKm }
 */
export default function SellerCard({ seller }) {
  const { slug, shopName, avatar, averageRating, numReviews, distanceKm } = seller;

  return (
    <Link
      to={`/shop/${slug}`}
      className="flex items-center gap-3 p-3 rounded-md border border-border bg-surface-raised hover:border-border-strong transition-colors"
    >
      <div className="h-14 w-14 rounded-full overflow-hidden bg-surface shrink-0">
        {avatar ? (
          <img src={avatar} alt={shopName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-muted text-xs">
            {shopName?.[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{shopName}</p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
          {averageRating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star size={12} weight="fill" className="text-primary" />
              {averageRating.toFixed(1)} ({numReviews})
            </span>
          )}
          {typeof distanceKm === "number" && (
            <span className="flex items-center gap-0.5">
              <MapPin size={12} />
              {distanceKm.toFixed(1)} km away
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

