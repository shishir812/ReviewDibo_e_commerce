type RatingStarsProps = {
  rating: number;
  size?: "sm" | "md";
};

export default function RatingStars({ rating, size = "md" }: RatingStarsProps) {
  const rounded = Math.round(rating);
  const className = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rounded ? "text-amber-400" : "text-slate-300"}>
          &#9733;
        </span>
      ))}
    </div>
  );
}
