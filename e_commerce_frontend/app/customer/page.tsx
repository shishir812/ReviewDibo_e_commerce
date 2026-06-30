"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import RatingStars from "@/components/RatingStars";
import {
  customerLogin,
  customerRegister,
  deleteCustomerReview,
  getCustomerReviews,
  updateCustomerReview
} from "@/lib/api";
import type { CustomerReview } from "@/types";

type ReviewDraft = {
  rating: number;
  comment: string;
};

export default function CustomerPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [token, setToken] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, ReviewDraft>>({});
  const [reviewToDelete, setReviewToDelete] = useState<CustomerReview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("customerToken");
    const savedUsername = window.localStorage.getItem("customerUsername");
    if (savedToken?.split(".").length === 3 && savedUsername) {
      window.localStorage.removeItem("adminToken");
      setToken(savedToken);
      setCurrentUsername(savedUsername);
    } else if (savedToken || savedUsername) {
      window.localStorage.removeItem("customerToken");
      window.localStorage.removeItem("customerUsername");
      window.dispatchEvent(new Event("customer-auth-changed"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadReviews(token);
    }
  }, [token]);

  async function loadReviews(customerToken: string) {
    try {
      const customerReviews = await getCustomerReviews(customerToken);
      setReviews(customerReviews);
      setReviewDrafts(
        customerReviews.reduce<Record<number, ReviewDraft>>((drafts, review) => {
          drafts[review.id] = {
            rating: review.rating,
            comment: review.comment ?? ""
          };
          return drafts;
        }, {})
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your reviews.");
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response =
        mode === "register"
          ? await customerRegister(username, password, confirmPassword)
          : await customerLogin(username, password);

      window.localStorage.setItem("customerToken", response.token);
      window.localStorage.setItem("customerUsername", response.username);
      window.localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("customer-auth-changed"));
      setToken(response.token);
      setCurrentUsername(response.username);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setMessage(mode === "register" ? "Registration successful." : "Login successful.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("customerToken");
    window.localStorage.removeItem("customerUsername");
    window.dispatchEvent(new Event("customer-auth-changed"));
    setToken("");
    setCurrentUsername("");
    setReviews([]);
    setReviewDrafts({});
    setReviewToDelete(null);
    setMessage(null);
    setError(null);
  }

  async function handleUpdateReview(review: CustomerReview) {
    const draft = reviewDrafts[review.id];
    if (!draft) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateCustomerReview(
        review.id,
        {
          rating: draft.rating,
          comment: draft.comment.trim() || null
        },
        token
      );
      setMessage("Review updated successfully.");
      await loadReviews(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update review.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview() {
    if (!reviewToDelete) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await deleteCustomerReview(reviewToDelete.id, token);
      setMessage("Review deleted successfully.");
      setReviewToDelete(null);
      await loadReviews(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Customer account</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Your reviews</h1>
        </div>
        {token ? (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Logout
          </button>
        ) : (
          <Link href="/" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-primary hover:text-primary">
            Storefront
          </Link>
        )}
      </div>

      {message ? <p className="mb-4 rounded-md border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald">{message}</p> : null}
      {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {!token ? (
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Username {mode === "register" ? <span className="text-red-500">*</span> : null}</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Password {mode === "register" ? <span className="text-red-500">*</span> : null}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={mode === "register" ? 6 : undefined}
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {mode === "register" ? (
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Confirm password <span className="text-red-500">*</span></span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
                  className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "register" ? "Register" : "Login"}
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Welcome, {currentUsername}</h2>
              <p className="mt-1 text-sm text-slate-500">Edit the reviews connected to your username.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary hover:text-primary">
                Browse products
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {reviews.length ? (
              reviews.map((review) => {
                const draft = reviewDrafts[review.id] ?? { rating: review.rating, comment: review.comment ?? "" };
                return (
                  <article key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{review.product_title}</h3>
                        <RatingStars rating={review.rating} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateReview(review)}
                          disabled={loading}
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setReviewToDelete(review)}
                          disabled={loading}
                          className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]">
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Rating
                        <select
                          value={draft.rating}
                          onChange={(event) =>
                            setReviewDrafts({
                              ...reviewDrafts,
                              [review.id]: { ...draft, rating: Number(event.target.value) }
                            })
                          }
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-primary focus:border-primary"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Comment
                        <textarea
                          value={draft.comment}
                          onChange={(event) =>
                            setReviewDrafts({
                              ...reviewDrafts,
                              [review.id]: { ...draft, comment: event.target.value }
                            })
                          }
                          rows={3}
                          className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-primary focus:border-primary"
                          placeholder="Optional"
                        />
                      </label>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                You have not submitted any reviews yet.
              </p>
            )}
          </div>
        </section>
      )}

      {reviewToDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Confirm deletion</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Delete this review?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This will permanently remove your review for &quot;{reviewToDelete.product_title}&quot;.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={loading}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={loading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
