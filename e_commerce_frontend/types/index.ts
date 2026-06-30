export type ProductSummary = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  average_rating: number;
  review_count: number;
};

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ProductDetail = ProductSummary & {
  reviews: Review[];
};

export type ReviewPayload = {
  product_id: number;
  name: string;
  rating: number;
  comment?: string | null;
};

export type ReviewUpdatePayload = {
  rating: number;
  comment?: string | null;
};

export type ProductPayload = {
  title: string;
  description: string;
  image_url: string;
};

export type CustomerReview = {
  id: number;
  product_id: number;
  product_title: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
