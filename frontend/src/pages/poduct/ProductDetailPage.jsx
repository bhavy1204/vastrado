import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  WhatsappLogo,
  ChatCircleDots,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { productService, reviewService, userService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import {
  formatPrice,
  formatDiscount,
  buildWhatsAppLink,
  formatProductType,
} from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import ReviewList from "@/components/product/ReviewList";
import ReviewForm from "@/components/product/ReviewForm";
import { Package } from "@phosphor-icons/react";
import { ArrowRight } from "@phosphor-icons/react";

/**
 * ProductDetailPage — /products/:slug
 * IG-post layout: image carousel, seller strip, price/variants, action
 * row (wishlist / WhatsApp enquiry / review), reviews below.
 */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { actorType } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
  } = usePagination(1, 10);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);


  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setNotFound(false);
    setActiveImage(0);

    productService
      .getBySlug(slug)
      .then((res) => {
        if (!isCancelled) {
          setProduct(res.data.data);
          setIsWishlisted(!!res.data.data.isWishlisted);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          if (err?.response?.status === 404) setNotFound(true);
          else
            toast.error(
              err?.response?.data?.message || "Couldn't load this product",
            );
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const fetchReviews = useCallback(() => {
    if (!product?._id) return;
    setIsLoadingReviews(true);
    reviewService
      .getProductReviews(product._id, params)
      .then((res) => {
        setReviews(res.data.data.reviews);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoadingReviews(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleWishlist = async () => {
    if (actorType !== "user") {
      toast.error("Log in to save items to your wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await userService.removeFromWishlist(product._id);
      } else {
        await userService.addToWishlist(product._id);
      }
      setIsWishlisted((prev) => !prev);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't update your wishlist",
      );
    }
  };

  const handleWhatsAppEnquiry = () => {
    const phone = product?.sellerId?.whatsappNumber;
    if (!phone) {
      toast.error("This seller hasn't listed a contact number");
      return;
    }
    const message = `Hi, I'm interested in "${product.name}" (${formatPrice(product.discountedPrice || product.price)}) on CLothMarket.`;
    window.open(
      buildWhatsAppLink(phone, message),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return <Loader className="py-24" label="Loading product..." />;
  }

  if (notFound || !product) {
    return (
      <EmptyState
        className="py-24"
        icon={<Package size={26} weight="duotone" />}
        title="Product not found"
        description="This product may have been removed or the link is incorrect."
      />
    );
  }

  const {
    name,
    images = [],
    price,
    discountedPrice,
    productDescription,
    type,
    gender,
    variants,
  } = product;
  const seller = product.sellerId;
  const hasDiscount = discountedPrice && discountedPrice < price;

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
        {/* ================= LEFT COLUMN — GALLERY ================= */}
        <div className="lg:sticky lg:top-24 flex gap-4">
          {/* Thumbnails (vertical strip) */}
          {images.length > 1 && (
            <div className="flex flex-col gap-3 max-h-130 overflow-y-auto pr-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={[
                    "overflow-hidden rounded-xl border-2 transition-all duration-200 shrink-0",
                    activeImage === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-border",
                  ].join(" ")}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm aspect-square">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={name}
                className="h-full w-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN — INFO ================= */}
        <div className="flex flex-col gap-8">
          {/* Seller */}
          {seller && (
            <Link
              to={`/shop/${seller.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-border bg-surface-raised px-5 py-4 transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-border bg-surface shrink-0">
                  {seller.avatar && (
                    <img
                      src={seller.avatar}
                      alt={seller.shopName}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-muted">
                    Sold by
                  </p>
                  <h3 className="font-semibold text-text transition-colors group-hover:text-primary">
                    {seller.shopName}
                  </h3>
                  <p className="text-sm -mt-1 text-text-muted capitalize">
                    {seller.cityId.name}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">
                View Shop →
              </span>
            </Link>
          )}

          {/* Title + Rating */}
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text leading-tight">
              {name}
            </h1>

            {product.numReviews > 0 && (
              <p className="text-sm text-text-muted">
                ★ {product.averageRating?.toFixed(1) || "0.0"} ·{" "}
                {product.numReviews} review
                {product.numReviews !== 1 ? "s" : ""}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              {gender && (
                <span className="rounded-full bg-surface px-3 py-1 border border-border">
                  {gender}
                </span>
              )}
              {type && (
                <span className="rounded-full bg-surface px-3 py-1 border border-border">
                  {formatProductType(type)}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold text-text">
                {formatPrice(hasDiscount ? discountedPrice : price)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-lg text-text-muted line-through">
                    {formatPrice(price)}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {formatDiscount(price, discountedPrice)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-text-muted">Inclusive of all taxes</p>
          </div>

          {/* Sizes */}
          {variants?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text">Available Sizes</h3>
                <span className="text-xs text-text-muted">
                  {variants.length} options
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => (
                  <div
                    key={variant._id}
                    className="rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <div className="text-sm font-semibold text-text text-center">
                      {variant.size}
                    </div>
                    <div className="mt-1 text-[11px] text-text-muted text-center">
                      {variant.quantity} available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions — WhatsApp + Wishlist side by side */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              variant="secondary"
              leftIcon={<WhatsappLogo size={18} />}
              onClick={handleWhatsAppEnquiry}
            >
              WhatsApp
            </Button>

            <Button
              variant="primary"
              leftIcon={
                <Heart
                  size={18}
                  weight={isWishlisted ? "fill" : "regular"}
                  className={isWishlisted ? "text-primary" : ""}
                />
              }
              onClick={handleToggleWishlist}
            >
              Wishlist
            </Button>
          </div>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      {productDescription && (
        <div className="my-6">
          <h2 className="mb-4 text-2xl font-semibold text-text">
            Product Description
          </h2>
          <p className="leading-8 text-text-secondary mb-5 pl-2">
            {productDescription}
          </p>
        </div>
      )}

      {/* ================= REVIEWS ================= */}
      <section
        id="reviews"
        className="mt-16 rounded-3xl border border-border bg-surface-raised shadow-sm overflow-hidden"
      >
        <div className="border-b border-border px-6 py-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-text">Customer Reviews</h2>
              <p className="mt-1 text-sm text-text-muted">
                See what other customers are saying about this product.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-2 text-center">
              <p className="text-2xl font-bold text-text">
                {product.averageRating?.toFixed(1) || "0.0"}
              </p>
              <p className="text-xs text-text-muted">
                {product.numReviews || 0} review
                {product.numReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 lg:px-8 flex flex-col gap-8">
          {actorType === "user" && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-4 text-lg font-semibold text-text">
                Write a Review
              </h3>
              <ReviewForm productId={product._id} onSuccess={fetchReviews} />
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5 mx-auto">
            <ReviewList
              reviews={reviews}
              isLoading={isLoadingReviews}
              pagination={{
                page,
                totalPages,
                onNext: nextPage,
                onPrev: prevPage,
                onGoTo: goToPage,
                hasNextPage,
                hasPrevPage,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
