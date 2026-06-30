from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.jwt_auth import decode_access_token, get_bearer_token


def require_admin(authorization: str | None = Header(default=None)) -> None:
    payload = decode_access_token(get_bearer_token(authorization))
    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required",
        )
