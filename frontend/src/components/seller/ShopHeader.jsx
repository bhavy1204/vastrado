import { PencilSimple, MapPin, Star, Plus } from "@phosphor-icons/react";
import Button from "@/components/common/Button";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

/**
 * ShopHeader
 *   <ShopHeader seller={seller} isOwner={isOwner} onEditBanner={fn} onEditAvatar={fn}
 *               onEditDescription={fn} onOpenLocation={fn} onAddProduct={fn} />
 *
 * When isOwner=true, edit affordances appear on banner/avatar/description
 * and a "+" button shows top-right to add a product.
 */
export default function ShopHeader({
  seller,
  isOwner = false,
  onEditBanner,
  onEditAvatar,
  onEditDescription,
  onOpenLocation,
  onAddProduct,
}) {
  const { shopName, description, avatar, banner, averageRating, numReviews, subscriptionStatus } = seller;

  return (
    <div className="relative">
      <div className="relative h-40 sm:h-56 w-full bg-surface overflow-hidden">
        {banner ? (
          <img src={banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary-subtle" />
        )}

        {isOwner && (
          <EditButton onClick={onEditBanner} className="absolute top-3 right-3" label="Edit banner" />
        )}

        {isOwner && onAddProduct && (
          <button
            type="button"
            onClick={onAddProduct}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 h-9 px-3 rounded-full bg-primary text-text-on-primary text-sm font-medium shadow-md hover:bg-primary-hover"
          >
            <Plus size={16} weight="bold" /> Add product
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div className="relative -mt-10 sm:-mt-12 flex items-end gap-4">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-4 ring-surface-raised overflow-hidden bg-surface shrink-0">
            {avatar ? (
              <img src={avatar} alt={shopName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl text-text-muted">
                {shopName?.[0]}
              </div>
            )}
            {isOwner && (
              <EditButton onClick={onEditAvatar} className="absolute bottom-0 right-0" label="Edit avatar" small />
            )}
          </div>

          {subscriptionStatus && (
            <div className="mb-1.5 hidden sm:block">
              <SubscriptionStatusBadge status={subscriptionStatus} />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1.5 pb-4">
          <h1 className="text-lg font-bold text-text">{shopName}</h1>

          <div className="relative group flex items-start gap-2">
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              {description || (isOwner ? "Add a description so customers know what you sell." : "")}
            </p>
            {isOwner && (
              <button
                type="button"
                onClick={onEditDescription}
                aria-label="Edit description"
                className="text-text-muted hover:text-primary shrink-0 mt-0.5"
              >
                <PencilSimple size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {averageRating > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-text bg-surface border border-border rounded-full px-3 py-1">
                <Star size={14} weight="fill" className="text-primary" />
                {averageRating.toFixed(1)} ({numReviews})
              </span>
            )}
            <Button variant="secondary" size="sm" leftIcon={<MapPin size={15} />} onClick={onOpenLocation}>
              Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditButton({ onClick, className = "", label, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex items-center justify-center rounded-full bg-surface-raised/90 backdrop-blur text-text-secondary shadow-sm hover:text-primary",
        small ? "h-6 w-6" : "h-8 w-8",
        className,
      ].join(" ")}
    >
      <PencilSimple size={small ? 12 : 14} />
    </button>
  );
}


