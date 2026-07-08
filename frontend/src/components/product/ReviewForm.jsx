import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { reviewSchema } from "@/lib/validators";
import { reviewService } from "@/api";
import Button from "@/components/common/Button";

/**
 * ReviewForm
 *   <ReviewForm productId={productId} onSuccess={() => refetchReviews()} />
 */
export default function ReviewForm({ productId, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await reviewService.addReview(productId, data);
      toast.success("Review posted");
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't post your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-text mb-1.5">Your rating</p>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    aria-label={`${value} star`}
                    className="p-0.5"
                  >
                    <Star
                      size={22}
                      weight={value <= field.value ? "fill" : "regular"}
                      className={value <= field.value ? "text-primary" : "text-border-strong"}
                    />
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-xs text-error mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register("comment")}
          rows={3}
          placeholder="Share details about fit, fabric, quality..."
          className="w-full rounded-md border border-border bg-surface-raised text-sm text-text placeholder:text-text-muted p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-error mt-1">{errors.comment.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="self-start">
        Post review
      </Button>
    </form>
  );
}

