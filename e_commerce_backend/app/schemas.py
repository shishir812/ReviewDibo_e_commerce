from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    product_id: int
    name: str = Field(..., min_length=1, max_length=120)
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ProductCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=180)
    description: str = Field(..., min_length=1)
    image_url: str = Field(..., min_length=1, max_length=500)


class ProductUpdate(ProductCreate):
    pass


class ImageUploadResponse(BaseModel):
    image_url: str


class AdminLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class AdminToken(BaseModel):
    token: str


class CustomerRegister(BaseModel):
    username: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)


class CustomerLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)


class CustomerToken(BaseModel):
    token: str
    username: str


class ReviewRead(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewWithUser(BaseModel):
    id: int
    user_name: str
    rating: int
    comment: str | None
    created_at: datetime


class ProductSummary(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    average_rating: float
    review_count: int


class ProductDetail(ProductSummary):
    reviews: list[ReviewWithUser]


class CustomerReview(BaseModel):
    id: int
    product_id: int
    product_title: str
    rating: int
    comment: str | None
    created_at: datetime
