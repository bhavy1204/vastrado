import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CaretLeft,
  CaretRight,
  MapPin,
  Storefront,
  ArrowRight,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { siteContentService, productService } from "@/api/index";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/common/Button";

/**
 * HomePage — /
 * Hero: auto-advancing image slider built from siteContentService.getAllBanners()
 * (no carousel library in the stack, so this is a small hand-rolled one).
 * Below: nearby-shops CTA, newest products, FAQ preview.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <BannerSlider />

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <NearbyCTA />
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10">
        <FeaturedProducts />
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14">
        <FAQPreview />
      </section>
    </div>
  );
}

/* ── Banner slider ────────────────────────────────────────────────────── */

const AUTOPLAY_INTERVAL_MS = 5000;

function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    siteContentService
      .getAllBanners()
      .then((res) => {
        if (isCancelled) return;
        const payload = res.data?.banners ?? res.data?.data ?? res.data;
        setBanners(Array.isArray(payload) ? payload : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const goTo = useCallback(
    (index) => {
      if (banners.length === 0) return;
      setActiveIndex(
        ((index % banners.length) + banners.length) % banners.length,
      );
    },
    [banners.length],
  );

  const resetAutoplay = useCallback(() => {
    clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
      }, AUTOPLAY_INTERVAL_MS);
    }
  }, [banners.length]);

  useEffect(() => {
    resetAutoplay();
    return () => clearInterval(timerRef.current);
  }, [resetAutoplay]);

  const handleManualNav = (index) => {
    goTo(index);
    resetAutoplay();
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-16/6 sm:aspect-16/4 bg-surface animate-pulse" />
    );
  }

  if (banners.length === 0) {
    // Fallback hero when no banners are configured yet
    return (
      <div className="w-full bg-primary-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Discover local clothing shops near you
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Browse shops, enquire directly on WhatsApp — no middlemen.
          </p>
          <Link to="/nearby">
            <Button variant="primary" className="mt-5">
              Find shops near me
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-16/6 sm:aspect-16/4 overflow-hidden bg-surface"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={resetAutoplay}
    >
      {banners.map((banner, index) => (
        <BannerSlide
          key={banner._id}
          banner={banner}
          isActive={index === activeIndex}
        />
      ))}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => handleManualNav(activeIndex - 1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface-raised/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-text"
          >
            <CaretLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleManualNav(activeIndex + 1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface-raised/80 backdrop-blur flex items-center justify-center text-text-secondary hover:text-text"
          >
            <CaretRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleManualNav(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-surface-raised/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BannerSlide({ banner, isActive }) {
  const content = (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
    >
      <img
        src={banner.image}
        alt={banner.title || ""}
        className="h-full w-full object-cover"
        loading={isActive ? "eager" : "lazy"}
      />
      {banner.title && (
        <div className="absolute inset-0 bg-linear-to-t from-text/50 via-transparent to-transparent flex items-end">
          <p className="text-white text-sm sm:text-lg font-semibold p-4 sm:p-6">
            {banner.title}
          </p>
        </div>
      )}
    </div>
  );

  return banner.link ? (
    <Link to={banner.link} className="contents">
      {content}
    </Link>
  ) : (
    content
  );
}

/* ── Nearby CTA ───────────────────────────────────────────────────────── */

function NearbyCTA() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
          <MapPin size={20} />
        </div>
        <div>
          <p className="text-base font-semibold text-text">Shops near you</p>
          <p className="text-sm text-text-muted">
            Find clothing shops within walking distance
          </p>
        </div>
      </div>
      <Link to="/nearby">
        <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
          Explore nearby
        </Button>
      </Link>
    </div>
  );
}

/* ── Featured products ───────────────────────────────────────────────── */

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    productService
      .getAll({ sort: "newest", limit: 8, page: 1 })
      .then((res) => {
        if (!isCancelled) setProducts(res.data?.products || res.data || []);
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Couldn't load products"),
      )
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">New arrivals</h2>
        <Link
          to="/products"
          className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyTitle="No products yet"
      />
    </div>
  );
}

/* ── FAQ preview ──────────────────────────────────────────────────────── */

function FAQPreview() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    siteContentService
      .getAllFAQs()
      .then((res) => {
        if (!isCancelled)
          setFaqs((res.data?.faqs || res.data || []).slice(0, 5));
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-lg font-bold text-text">
        Frequently asked questions
      </h2>
      <div className="rounded-md border border-border bg-surface-raised divide-y divide-border">
        {faqs.map((faq) => {
          const isOpen = openId === faq._id;
          return (
            <button
              key={faq._id}
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq._id)}
              className="w-full text-left p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-text">
                  {faq.question}
                </span>
                {isOpen ? (
                  <Minus size={16} className="text-text-muted shrink-0" />
                ) : (
                  <Plus size={16} className="text-text-muted shrink-0" />
                )}
              </div>
              {isOpen && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}



