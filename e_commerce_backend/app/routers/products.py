from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app import crud, schemas
from app.admin_auth import require_admin
from app.config import UPLOAD_DIR, get_settings
from app.database import get_db


router = APIRouter(prefix="/api/products", tags=["products"])
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.get("", response_model=list[schemas.ProductSummary])
def list_products(db: Session = Depends(get_db)) -> list[schemas.ProductSummary]:
    return crud.get_products(db)


@router.get("/{product_id}", response_model=schemas.ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)) -> schemas.ProductDetail:
    product = crud.get_product_detail(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductSummary)
def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> schemas.ProductSummary:
    product = crud.create_product(db, product_data)
    return crud.product_to_summary(product, {})


@router.put("/{product_id}", response_model=schemas.ProductSummary)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> schemas.ProductSummary:
    product = crud.update_product(db, product_id, product_data)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    stats = crud.get_rating_stats(db)
    return crud.product_to_summary(product, stats)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> Response:
    deleted = crud.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return Response(status_code=204)


@router.post("/upload-image", response_model=schemas.ImageUploadResponse)
async def upload_product_image(
    image: UploadFile = File(...),
    _: None = Depends(require_admin),
) -> schemas.ImageUploadResponse:
    extension = ALLOWED_IMAGE_TYPES.get(image.content_type or "")
    if extension is None:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, and GIF images are allowed")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    path = UPLOAD_DIR / filename

    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller")

    path.write_bytes(contents)

    backend_url = get_settings().backend_url.rstrip("/")
    return schemas.ImageUploadResponse(image_url=f"{backend_url}/uploads/{filename}")
