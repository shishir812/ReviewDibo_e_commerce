"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { createReview } from "@/lib/api";
import type { Review } from "@/types";

type ReviewFormProps = {
  productId: number;
  existingReview?: Review | null;
  onSubmitted: () => Promise<void>;
};

export default function ReviewForm({ productId, existingReview, onSubmitted }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockedName, setLockedName] = useState(false);

  useEffect(() => {
    const customerUsername = window.localStorage.getItem("customerUsername");
    if (customerUsername) {
      setName(customerUsername);
      setLockedName(true);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await createReview(
        { product_id: productId, name, rating, comment },
        window.localStorage.getItem("customerToken")
      );
      setName(window.localStorage.getItem("customerUsername") ?? "");
      setRating(5);
      setComment("");
      setMessage("Review submitted successfully.");
      await onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lockedName && existingReview) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Your review already exists</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You have already reviewed this product. You can update your rating or comment from your customer account.
        </p>
        <Link
          href="/customer"
          className="mt-5 inline-flex w-full justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          Update your review
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">Write a review</h2>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            readOnly={lockedName}
            required
            minLength={1}
            className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-600"
            placeholder="John"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Rating
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Comment
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            className="resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Share your experience... (optional)"
          />
        </label>
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-emerald">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
