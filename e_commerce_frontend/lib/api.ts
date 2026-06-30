import type {
  CustomerReview,
  ProductDetail,
  ProductPayload,
  ProductSummary,
  ReviewPayload,
  ReviewUpdatePayload
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const error = await response.json();
      message = error.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getProducts(): Promise<ProductSummary[]> {
  return request<ProductSummary[]>("/api/products");
}

export function getProduct(id: string | number): Promise<ProductDetail> {
  return request<ProductDetail>(`/api/products/${id}`);
}

export function createReview(payload: ReviewPayload, token?: string | null): Promise<void> {
  return request<void>("/api/reviews", {
    method: "POST",
    headers: token ? authHeaders(token) : undefined,
    body: JSON.stringify(payload)
  });
}

export function adminLogin(username: string, password: string): Promise<{ token: string }> {
  return request<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function createProduct(payload: ProductPayload, token: string): Promise<ProductSummary> {
  return request<ProductSummary>("/api/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function updateProduct(
  productId: number,
  payload: ProductPayload,
  token: string
): Promise<ProductSummary> {
  return request<ProductSummary>(`/api/products/${productId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function deleteProduct(productId: number, token: string): Promise<void> {
  return request<void>(`/api/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function uploadProductImage(file: File, token: string): Promise<{ image_url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData
  });

  if (!response.ok) {
    let message = "Unable to upload image.";
    try {
      const error = await response.json();
      message = error.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<{ image_url: string }>;
}

export function updateReview(
  reviewId: number,
  payload: ReviewUpdatePayload,
  token: string
): Promise<void> {
  return request<void>(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function deleteReview(reviewId: number, token: string): Promise<void> {
  return request<void>(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export function customerRegister(
  username: string,
  password: string,
  confirmPassword: string
): Promise<{ token: string; username: string }> {
  return request<{ token: string; username: string }>("/api/customers/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      confirm_password: confirmPassword
    })
  });
}

export function customerLogin(username: string, password: string): Promise<{ token: string; username: string }> {
  return request<{ token: string; username: string }>("/api/customers/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function getCustomerReviews(token: string): Promise<CustomerReview[]> {
  return request<CustomerReview[]>("/api/customers/reviews", {
    headers: authHeaders(token)
  });
}

export function updateCustomerReview(
  reviewId: number,
  payload: ReviewUpdatePayload,
  token: string
): Promise<void> {
  return request<void>(`/api/customers/reviews/${reviewId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function deleteCustomerReview(reviewId: number, token: string): Promise<void> {
  return request<void>(`/api/customers/reviews/${reviewId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}
