"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import RatingStars from "@/components/RatingStars";
import {
  adminLogin,
  createProduct,
  deleteProduct,
  deleteReview,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImage
} from "@/lib/api";
import type { ProductDetail, ProductSummary, Review } from "@/types";

type ProductPanel = "edit" | "reviews" | null;
type AdminView = "products" | "add";
type DeleteDialog =
  | { type: "product"; product: ProductSummary }
  | { type: "review"; review: Review }
  | null;

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [productPanel, setProductPanel] = useState<ProductPanel>(null);
  const [adminView, setAdminView] = useState<AdminView>("products");
  const [productForm, setProductForm] = useState({ title: "", description: "", image_url: "" });
  const [editProductForm, setEditProductForm] = useState({ title: "", description: "", image_url: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>(null);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(productSearch.trim().toLowerCase())
  );

  useEffect(() => {
    const savedToken = window.localStorage.getItem("adminToken");
    if (savedToken?.split(".").length === 3) {
      window.localStorage.removeItem("customerToken");
      window.localStorage.removeItem("customerUsername");
      window.dispatchEvent(new Event("customer-auth-changed"));
      setToken(savedToken);
    } else if (savedToken) {
      window.localStorage.removeItem("adminToken");
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadProducts();
  }, [token]);

  useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null);
      return;
    }

    loadSelectedProduct(selectedProductId);
  }, [selectedProductId]);

  async function loadProducts() {
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    }
  }

  async function loadSelectedProduct(productId: number) {
    try {
      const product = await getProduct(productId);
      setSelectedProduct(product);
      setEditProductForm({
        title: product.title,
        description: product.description,
        image_url: product.image_url
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load product.");
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await adminLogin(username, password);
      window.localStorage.setItem("adminToken", response.token);
      window.localStorage.removeItem("customerToken");
      window.localStorage.removeItem("customerUsername");
      window.dispatchEvent(new Event("customer-auth-changed"));
      setToken(response.token);
      setMessage("Admin login successful.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("adminToken");
    setToken("");
    setSelectedProduct(null);
    setSelectedProductId(null);
    setProductPanel(null);
    setAdminView("products");
    setDeleteDialog(null);
    setMessage(null);
    setError(null);
    router.push("/");
  }

  function handleShowReviews(productId: number) {
    setSelectedProductId(productId);
    setProductPanel("reviews");
  }

  function handleEditProduct(productId: number) {
    setSelectedProductId(productId);
    setProductPanel("edit");
  }

  function handleBackToProducts() {
    setProductPanel(null);
    setSelectedProduct(null);
    setSelectedProductId(null);
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await createProduct(productForm, token);
      setProductForm({ title: "", description: "", image_url: "" });
      setMessage("Product added successfully.");
      setAdminView("products");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProductId) {
      setError("Select a product first.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateProduct(selectedProductId, editProductForm, token);
      setMessage("Product updated successfully.");
      await loadSelectedProduct(selectedProductId);
      await loadProducts();
      setProductPanel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update product.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteProduct(product: ProductSummary) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await deleteProduct(product.id, token);
      if (selectedProductId === product.id) {
        setSelectedProduct(null);
        setSelectedProductId(null);
        setProductPanel(null);
      }
      setMessage("Product deleted successfully.");
      setDeleteDialog(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setError(null);
    setMessage(null);

    try {
      const response = await uploadProductImage(file, token);
      setProductForm((currentForm) => ({ ...currentForm, image_url: response.image_url }));
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleEditImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setError(null);
    setMessage(null);

    try {
      const response = await uploadProductImage(file, token);
      setEditProductForm((currentForm) => ({ ...currentForm, image_url: response.image_url }));
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function confirmDeleteReview(review: Review) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await deleteReview(review.id, token);
      setMessage("Review deleted successfully.");
      setDeleteDialog(null);
      if (selectedProductId) {
        await loadSelectedProduct(selectedProductId);
      }
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete review.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteDialog) {
      return;
    }

    if (deleteDialog.type === "product") {
      await confirmDeleteProduct(deleteDialog.product);
      return;
    }

    await confirmDeleteReview(deleteDialog.review);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin panel</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Manage products and reviews</h1>
          {token ? (
            <p className="mt-2 text-sm text-slate-500">Inventory, review moderation, and catalog maintenance.</p>
          ) : null}
        </div>
        {token ? (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Logout
          </button>
        ) : null}
      </div>

      {message ? <p className="mb-4 rounded-md border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald">{message}</p> : null}
      {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {!token ? (
        <form onSubmit={handleLogin} className="max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Admin login</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : productPanel === "edit" ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Product details</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                {selectedProduct ? `Update ${selectedProduct.title}` : "Loading product..."}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBackToProducts}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
            >
              Back to products
            </button>
          </div>

          <form onSubmit={handleUpdateProduct} className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-white">
                {editProductForm.image_url ? (
                  <img
                    src={editProductForm.image_url}
                    alt={editProductForm.title || "Product preview"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-4 text-sm font-semibold text-ink">
                {selectedProduct?.review_count ?? 0} review{selectedProduct?.review_count === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedProduct ? `${selectedProduct.average_rating.toFixed(1)} average rating` : "Product data is loading."}
              </p>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Title
                <input
                  value={editProductForm.title}
                  onChange={(event) => setEditProductForm({ ...editProductForm, title: event.target.value })}
                  required
                  disabled={!selectedProduct}
                  className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Image URL
                <input
                  value={editProductForm.image_url}
                  onChange={(event) => setEditProductForm({ ...editProductForm, image_url: event.target.value })}
                  required
                  disabled={!selectedProduct}
                  className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Upload replacement image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleEditImageUpload}
                  disabled={!selectedProduct || uploadingImage}
                  className="block w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="text-xs font-normal text-slate-500">
                  {uploadingImage ? "Uploading image..." : "Choose JPG, PNG, WEBP, or GIF."}
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={editProductForm.description}
                  onChange={(event) => setEditProductForm({ ...editProductForm, description: event.target.value })}
                  required
                  rows={7}
                  disabled={!selectedProduct}
                  className="resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading || !selectedProduct}
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save product"}
                </button>
                {selectedProduct ? (
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ type: "product", product: selectedProduct })}
                    disabled={loading}
                    className="rounded-md border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete product
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </section>
      ) : productPanel === "reviews" ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Product reviews</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                {selectedProduct ? selectedProduct.title : "Loading product..."}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBackToProducts}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
            >
              Back to products
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {selectedProduct?.reviews.length ? (
              selectedProduct.reviews.map((review) => (
                <article
                  key={review.id}
                  className="grid items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[150px_100px_1fr_auto]"
                >
                  <h3 className="truncate text-sm font-semibold text-ink">{review.user_name}</h3>
                  <RatingStars rating={review.rating} size="sm" />
                  <p className="truncate text-sm text-slate-600">{review.comment || "No comment"}</p>
                  <button
                    onClick={() => setDeleteDialog({ type: "review", review })}
                    disabled={loading}
                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                {selectedProduct ? "This product has no reviews yet." : "Product reviews are loading."}
              </p>
            )}
          </div>
        </section>
      ) : (
        <div>
          <div className="mb-5 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAdminView("products")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                adminView === "products" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-primary"
              }`}
            >
              Product List
            </button>
            <button
              type="button"
              onClick={() => setAdminView("add")}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                adminView === "add" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:text-primary"
              }`}
            >
              Add Product
            </button>
          </div>

          {adminView === "add" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-ink">Add product</h2>
            </div>
            <form onSubmit={handleCreateProduct} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Title
                <input
                  value={productForm.title}
                  onChange={(event) => setProductForm({ ...productForm, title: event.target.value })}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Image URL
                <input
                  value={productForm.image_url}
                  onChange={(event) => setProductForm({ ...productForm, image_url: event.target.value })}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Upload from device
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="block w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="text-xs font-normal text-slate-500">
                  {uploadingImage ? "Uploading image..." : "Choose JPG, PNG, WEBP, or GIF. The URL fills automatically."}
                </span>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  required
                  rows={5}
                  className="resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add product"}
              </button>
            </form>

          </section>
          ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink">Product list</h2>
                <p className="mt-1 text-sm text-slate-500">Manage inventory details, reviews, and product visibility.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
                {products.length} product{products.length === 1 ? "" : "s"}
              </span>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
              Search product
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Type product name..."
              />
            </label>

            <div className="mt-5 grid gap-3">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="grid gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[120px_1fr] lg:grid-cols-[120px_1fr_auto]"
                  >
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-28 w-full rounded-md border border-slate-200 object-cover sm:w-28"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-ink">{product.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {product.average_rating.toFixed(1)} average
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {product.review_count} review{product.review_count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:w-48 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => handleShowReviews(product.id)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:text-primary"
                      >
                        Reviews
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product.id)}
                        className="rounded-md border border-primary bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-blue-50"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialog({ type: "product", product })}
                        disabled={loading}
                        className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No product found.
                </p>
              )}
            </div>
          </section>
          )}
        </div>
      )}

      {deleteDialog ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Confirm deletion</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {deleteDialog.type === "product" ? "Delete this product?" : "Delete this review?"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {deleteDialog.type === "product"
                  ? `This will permanently remove "${deleteDialog.product.title}" and all reviews connected to it.`
                  : `This will permanently remove ${deleteDialog.review.user_name}'s review.`}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                disabled={loading}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
