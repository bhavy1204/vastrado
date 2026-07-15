import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, WhatsappLogo, ChatCircleDots, CaretLeft, CaretRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { productService, reviewService, userService } from "@/api/index";
import useAuthStore from "@/store/useAuthStore";
import usePagination from "@/hooks/usePagination";
import { formatPrice, formatDiscount, buildWhatsAppLink, formatProductType } from "@/lib/formatters";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import ReviewList from "@/components/product/ReviewList";
import ReviewForm from "@/components/product/ReviewForm";
import { Package } from "@phosphor-icons/react";

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
    page, limit, params, totalPages, setTotalPages,
    nextPage, prevPage, goToPage, hasNextPage, hasPrevPage,
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
          else toast.error(err?.response?.data?.message || "Couldn't load this product");
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
      toast.error(err?.response?.data?.message || "Couldn't update your wishlist");
    }
  };

  const handleWhatsAppEnquiry = () => {
    const phone = product?.seller?.phone;
    if (!phone) {
      toast.error("This seller hasn't listed a contact number");
      return;
    }
    const message = `Hi, I'm interested in "${product.name}" (${formatPrice(product.discountedPrice || product.price)}) on CLothMarket.`;
    window.open(buildWhatsAppLink(phone, message), "_blank", "noopener,noreferrer");
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

  const { name, images = [], price, discountedPrice, productDescription, type, gender, seller, variants } = product;
  const hasDiscount = discountedPrice && discountedPrice < price;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      {/* Image carousel */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border">
        {images.length > 0 ? (
          <img src={images[activeImage]} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
            No image available
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1))}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-surface-raised/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-text"
            >
              <CaretLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1))}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-surface-raised/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-text"
            >
              <CaretRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-4 bg-primary" : "w-1.5 bg-surface-raised/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Seller strip */}
      {seller && (
        <Link to={`/shop/${seller.slug}`} className="flex items-center gap-2.5 group w-fit">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-surface shrink-0">
            {seller.avatar && <img src={seller.avatar} alt={seller.shopName} className="h-full w-full object-cover" />}
          </div>
          <span className="text-sm font-medium text-text group-hover:text-primary">{seller.shopName}</span>
        </Link>
      )}

      {/* Name, price, variants */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-bold text-text">{name}</h1>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {gender && <span>{gender}</span>}
          {type && <span>· {formatProductType(type)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-text">{formatPrice(hasDiscount ? discountedPrice : price)}</span>
          {hasDiscount && (
            <>
              <span className="text-sm text-text-muted line-through">{formatPrice(price)}</span>
              <span className="text-xs font-semibold text-primary">{formatDiscount(price, discountedPrice)}</span>
            </>
          )}
        </div>

        {variants?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {variants.map((variant) => (
              <span key={variant} className="text-xs rounded-full border border-border px-2.5 py-1 text-text-secondary">
                {variant}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 py-1">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Heart size={16} weight={isWishlisted ? "fill" : "regular"} className={isWishlisted ? "text-primary" : ""} />}
          onClick={handleToggleWishlist}
        >
          Wishlist
        </Button>
        <Button variant="primary" size="sm" leftIcon={<WhatsappLogo size={16} />} onClick={handleWhatsAppEnquiry}>
          Enquire on WhatsApp
        </Button>
        <Button variant="ghost" size="sm" leftIcon={<ChatCircleDots size={16} />} onClick={scrollToReviews}>
          Reviews
        </Button>
      </div>

      {productDescription && <p className="text-sm text-text-secondary leading-relaxed">{productDescription}</p>}

      {/* Reviews */}
      <div id="reviews" className="pt-4 border-t border-border flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-text">Reviews</h2>

        {actorType === "user" && (
          <ReviewForm productId={product._id} onSuccess={fetchReviews} />
        )}

        <ReviewList
          reviews={reviews}
          isLoading={isLoadingReviews}
          pagination={{ page, totalPages, onNext: nextPage, onPrev: prevPage, onGoTo: goToPage, hasNextPage, hasPrevPage }}
        />
      </div>
    </div>
  );
}


