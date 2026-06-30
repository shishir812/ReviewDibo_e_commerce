from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.admin_auth import require_admin
from app.customer_auth import require_customer
from app.database import get_db


router = APIRouter(prefix="/api/reviews", tags=["reviews"])


def get_optional_customer(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User | None:
    if not authorization:
        return None
    return require_customer(authorization, db)


@router.post("", response_model=schemas.ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: schemas.ReviewCreate,
    customer: models.User | None = Depends(get_optional_customer),
    db: Session = Depends(get_db),
) -> schemas.ReviewRead:
    if db.get(models.Product, review_data.product_id) is None:
        raise HTTPException(status_code=404, detail="Product not found")

    review_user = customer or crud.get_or_create_user_by_name(db, review_data.name)
    if customer is None and review_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please login to review with this registered username",
        )

    existing_review = crud.get_user_product_review(db, review_data.product_id, review_user.id)
    if review_user.password_hash and existing_review is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already reviewed this product. Please update your existing review.",
        )

    review = crud.create_review(db, review_data, review_user)
    return review


@router.put("/{review_id}", response_model=schemas.ReviewRead)
def update_review(
    review_id: int,
    review_data: schemas.ReviewUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> schemas.ReviewRead:
    review = crud.update_review(db, review_id, review_data)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> Response:
    deleted = crud.delete_review(db, review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
