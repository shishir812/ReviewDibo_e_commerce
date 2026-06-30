from __future__ import annotations

import hashlib

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.jwt_auth import create_access_token, decode_access_token, get_bearer_token


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def create_customer_token(user: models.User) -> str:
    return create_access_token(str(user.id), "customer", {"username": user.name})


def require_customer(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User:
    payload = decode_access_token(get_bearer_token(authorization))
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer permission required")

    user_id_text = str(payload.get("sub", ""))
    if not user_id_text.isdigit():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid customer token")

    user = db.get(models.User, int(user_id_text))
    if user is None or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid customer token")

    return user
