from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.customer_auth import create_customer_token, hash_password, require_customer
from app.database import get_db


router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.post("/register", response_model=schemas.CustomerToken, status_code=status.HTTP_201_CREATED)
def register_customer(
    customer_data: schemas.CustomerRegister,
    db: Session = Depends(get_db),
) -> schemas.CustomerToken:
    username = customer_data.username.strip()
    if customer_data.password != customer_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    user = db.scalar(select(models.User).where(func.lower(models.User.name) == username.lower()))
    if user and user.password_hash:
        raise HTTPException(status_code=409, detail="Username already registered")

    if user is None:
        user = models.User(name=username)
        db.add(user)

    user.password_hash = hash_password(customer_data.password)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username already registered") from exc

    db.refresh(user)
    return schemas.CustomerToken(token=create_customer_token(user), username=user.name)


@router.post("/login", response_model=schemas.CustomerToken)
def login_customer(
    credentials: schemas.CustomerLogin,
    db: Session = Depends(get_db),
) -> schemas.CustomerToken:
    user = db.scalar(
        select(models.User).where(func.lower(models.User.name) == credentials.username.strip().lower())
    )
    if user is None or user.password_hash != hash_password(credentials.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    return schemas.CustomerToken(token=create_customer_token(user), username=user.name)


@router.get("/reviews", response_model=list[schemas.CustomerReview])
def list_customer_reviews(
    customer: models.User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> list[schemas.CustomerReview]:
    reviews = db.execute(
        select(models.Review, models.Product.title)
        .join(models.Product, models.Product.id == models.Review.product_id)
        .where(models.Review.user_id == customer.id)
        .order_by(models.Review.created_at.desc())
    ).all()
    return [
        schemas.CustomerReview(
            id=review.id,
            product_id=review.product_id,
            product_title=product_title,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
        )
        for review, product_title in reviews
    ]


@router.put("/reviews/{review_id}", response_model=schemas.ReviewRead)
def update_customer_review(
    review_id: int,
    review_data: schemas.ReviewUpdate,
    customer: models.User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> schemas.ReviewRead:
    review = db.get(models.Review, review_id)
    if review is None or review.user_id != customer.id:
        raise HTTPException(status_code=404, detail="Review not found")

    review.rating = review_data.rating
    review.comment = review_data.comment.strip() if review_data.comment else None
    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_review(
    review_id: int,
    customer: models.User = Depends(require_customer),
    db: Session = Depends(get_db),
) -> Response:
    review = db.get(models.Review, review_id)
    if review is None or review.user_id != customer.id:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
