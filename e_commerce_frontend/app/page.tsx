"use client";

import { useEffect, useState } from "react";

import LoadingError from "@/components/LoadingError";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import type { ProductSummary } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [minimumRating, setMinimumRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(productSearch.trim().toLowerCase());
    const matchesRating =
      minimumRating === "all" || product.average_rating >= Number(minimumRating);
    return matchesSearch && matchesRating;
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await getProducts());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-7 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Product Gallery</h1>
      </section>

      <LoadingError loading={loading} error={error} loadingText="Loading products..." />

      {!loading && !error ? (
        <>
          <section className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Search products
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Type product name..."
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Filter by rating
              <select
                value={minimumRating}
                onChange={(event) => setMinimumRating(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All ratings</option>
                <option value="5">★★★★★</option>
                <option value="4">★★★★☆ & up</option>
                <option value="3">★★★☆☆ & up</option>
                <option value="2">★★☆☆☆ & up</option>
                <option value="1">★☆☆☆☆ & up</option>
              </select>
            </label>
          </section>

          {filteredProducts.length ? (
            <section className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No products match your search or rating filter.
            </p>
          )}
        </>
      ) : null}
    </main>
  );
}
