import { Star, ChatCircleDots } from "@phosphor-icons/react";
import { formatRelativeTime } from "@/lib/formatters";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Pagination from "@/components/common/Pagination";

/**
 * ReviewList
 *   <ReviewList reviews={reviews} isLoading={isLoading} pagination={paginationProps} />
 */
export default function ReviewList({ reviews, isLoading = false, pagination }) {
  if (isLoading) {
    return <Loader className="py-10" label="Loading reviews..." />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        icon={<ChatCircleDots size={26} weight="duotone" />}
        title="No reviews yet"
        description="Be the first to share what you think about this product."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {reviews.map((review) => (
        <div key={review._id} className="flex flex-col gap-1.5 pb-5 border-b border-border last:border-b-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text">
              {review.user?.fullName || "Anonymous"}
            </p>
            <span className="text-xs text-text-muted">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                weight={i < review.rating ? "fill" : "regular"}
                className={i < review.rating ? "text-primary" : "text-border-strong"}
              />
            ))}
          </div>

          {review.comment && (
            <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}

      {pagination && <Pagination {...pagination} />}
    </div>
  );
}

