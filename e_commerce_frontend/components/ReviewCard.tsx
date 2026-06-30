import RatingStars from "@/components/RatingStars";
import type { Review } from "@/types";

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(review.created_at));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{review.user_name}</h3>
          <p className="text-xs text-slate-500">{date}</p>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>
      {review.comment ? <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p> : null}
    </article>
  );
}
