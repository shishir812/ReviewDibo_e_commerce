import Image from "next/image";
import Link from "next/link";

import RatingStars from "@/components/RatingStars";
import type { ProductSummary } from "@/types";

type ProductCardProps = {
  product: ProductSummary;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft">
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="h-[88px]">
          <h2 className="line-clamp-1 min-h-6 text-base font-semibold text-ink">{product.title}</h2>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {product.description}
          </p>
        </div>
        <div className="mt-2 flex min-h-[60px] items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="min-w-0">
            <RatingStars rating={product.average_rating} size="sm" />
            <p className="mt-1 text-xs text-slate-500">
              {product.average_rating.toFixed(1)} ({product.review_count} reviews)
            </p>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
