"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import LoadingError from "@/components/LoadingError";
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import { getProduct } from "@/lib/api";
import type { ProductDetail } from "@/types";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [customerUsername, setCustomerUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setError(null);
      setProduct(await getProduct(params.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load product details.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    function syncCustomerUsername() {
      setCustomerUsername(window.localStorage.getItem("customerUsername") ?? "");
    }

    syncCustomerUsername();
    window.addEventListener("customer-auth-changed", syncCustomerUsername);
    window.addEventListener("storage", syncCustomerUsername);

    return () => {
      window.removeEventListener("customer-auth-changed", syncCustomerUsername);
      window.removeEventListener("storage", syncCustomerUsername);
    };
  }, []);

  const existingCustomerReview =
    product && customerUsername
      ? product.reviews.find(
          (review) => review.user_name.toLowerCase() === customerUsername.toLowerCase()
        ) ?? null
      : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-semibold text-primary hover:text-blue-600">
        Back to products
      </Link>

      <div className="mt-6">
        <LoadingError loading={loading} error={error} loadingText="Loading product details..." />
      </div>

      {!loading && !error && product ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.75fr]">
          <section>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h1 className="text-3xl font-semibold text-ink">{product.title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{product.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingStars rating={product.average_rating} />
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
                  {product.average_rating.toFixed(1)} average from {product.review_count} reviews
                </span>
              </div>
            </div>

            <section className="mt-6">
              <h2 className="text-xl font-semibold text-ink">Reviews</h2>
              <div className="mt-5 grid gap-4">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                    No reviews yet. Be the first to share your thoughts.
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ReviewForm
              productId={product.id}
              existingReview={existingCustomerReview}
              onSubmitted={loadProduct}
            />
          </aside>
        </div>
      ) : null}
    </main>
  );
}
