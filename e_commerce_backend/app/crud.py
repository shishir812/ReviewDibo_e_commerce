from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app import models, schemas


def get_rating_stats(db: Session) -> dict[int, tuple[float, int]]:
    rows = db.execute(
        select(
            models.Review.product_id,
            func.coalesce(func.avg(models.Review.rating), 0),
            func.count(models.Review.id),
        ).group_by(models.Review.product_id)
    ).all()
    return {
        product_id: (round(float(average), 1), int(count))
        for product_id, average, count in rows
    }


def product_to_summary(product: models.Product, stats: dict[int, tuple[float, int]]) -> schemas.ProductSummary:
    average_rating, review_count = stats.get(product.id, (0.0, 0))
    return schemas.ProductSummary(
        id=product.id,
        title=product.title,
        description=product.description,
        image_url=product.image_url,
        average_rating=average_rating,
        review_count=review_count,
    )


def get_products(db: Session) -> list[schemas.ProductSummary]:
    products = db.scalars(select(models.Product).order_by(models.Product.id)).all()
    stats = get_rating_stats(db)
    return [product_to_summary(product, stats) for product in products]


def get_product_detail(db: Session, product_id: int) -> schemas.ProductDetail | None:
    product = db.execute(
        select(models.Product)
        .options(joinedload(models.Product.reviews).joinedload(models.Review.user))
        .where(models.Product.id == product_id)
    ).unique().scalar_one_or_none()
    if product is None:
        return None

    stats = get_rating_stats(db)
    summary = product_to_summary(product, stats)
    reviews = sorted(product.reviews, key=lambda review: review.created_at, reverse=True)
    return schemas.ProductDetail(
        **summary.model_dump(),
        reviews=[
            schemas.ReviewWithUser(
                id=review.id,
                user_name=review.user.name,
                rating=review.rating,
                comment=review.comment,
                created_at=review.created_at,
            )
            for review in reviews
        ],
    )


def get_or_create_user_by_name(db: Session, name: str) -> models.User:
    cleaned_name = name.strip()
    user = db.scalar(select(models.User).where(func.lower(models.User.name) == cleaned_name.lower()))
    if user:
        return user

    user = models.User(name=cleaned_name)
    db.add(user)
    db.flush()
    return user


def create_review(
    db: Session,
    review_data: schemas.ReviewCreate,
    current_user: models.User | None = None,
) -> models.Review | None:
    product = db.get(models.Product, review_data.product_id)
    if product is None:
        return None

    user = current_user or get_or_create_user_by_name(db, review_data.name)
    review = models.Review(
        product_id=product.id,
        user_id=user.id,
        rating=review_data.rating,
        comment=review_data.comment.strip() if review_data.comment else None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_user_product_review(db: Session, product_id: int, user_id: int) -> models.Review | None:
    return db.scalar(
        select(models.Review).where(
            models.Review.product_id == product_id,
            models.Review.user_id == user_id,
        )
    )


def update_review(db: Session, review_id: int, review_data: schemas.ReviewUpdate) -> models.Review | None:
    review = db.get(models.Review, review_id)
    if review is None:
        return None

    review.rating = review_data.rating
    review.comment = review_data.comment.strip() if review_data.comment else None
    db.commit()
    db.refresh(review)
    return review


def create_product(db: Session, product_data: schemas.ProductCreate) -> models.Product:
    product = models.Product(
        title=product_data.title.strip(),
        description=product_data.description.strip(),
        image_url=product_data.image_url.strip(),
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session,
    product_id: int,
    product_data: schemas.ProductUpdate,
) -> models.Product | None:
    product = db.get(models.Product, product_id)
    if product is None:
        return None

    product.title = product_data.title.strip()
    product.description = product_data.description.strip()
    product.image_url = product_data.image_url.strip()
    db.commit()
    db.refresh(product)
    return product


def delete_review(db: Session, review_id: int) -> bool:
    review = db.get(models.Review, review_id)
    if review is None:
        return False

    db.delete(review)
    db.commit()
    return True


def delete_product(db: Session, product_id: int) -> bool:
    product = db.get(models.Product, product_id)
    if product is None:
        return False

    db.delete(product)
    db.commit()
    return True


def seed_products(db: Session) -> None:
    existing_count = db.scalar(select(func.count(models.Product.id)))
    if existing_count:
        return

    products = [
        models.Product(
            title="Laptop",
            description="A fast, reliable laptop for work, study, and everyday productivity.",
            image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
        ),
        models.Product(
            title="Smartphone",
            description="A sleek smartphone with a sharp display and dependable all-day performance.",
            image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        ),
        models.Product(
            title="Headphones",
            description="Comfortable wireless headphones with immersive sound and long battery life.",
            image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        ),
        models.Product(
            title="Smart Watch",
            description="A fitness-focused smart watch with health tracking and quick notifications.",
            image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        ),
        models.Product(
            title="Gaming Chair",
            description="An ergonomic gaming chair built for comfort through long sessions.",
            image_url="https://images.unsplash.com/photo-1612011213721-3936d387f318?auto=format&fit=crop&w=900&q=80",
        ),
    ]
    db.add_all(products)
    db.commit()
