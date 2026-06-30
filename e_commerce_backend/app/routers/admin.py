from __future__ import annotations

from secrets import compare_digest

from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.jwt_auth import create_access_token
from app.schemas import AdminLogin, AdminToken


router = APIRouter(prefix="/api/admin", tags=["admin"])


def _clean_credential(value: str) -> str:
    return value.strip().strip("\"'")


@router.post("/login", response_model=AdminToken)
def login(credentials: AdminLogin) -> AdminToken:
    settings = get_settings()
    username = _clean_credential(credentials.username)
    password = _clean_credential(credentials.password)
    admin_username = _clean_credential(settings.admin_username)
    admin_password = _clean_credential(settings.admin_password)

    if (
        not compare_digest(username, admin_username)
        or not compare_digest(password, admin_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin username or password",
        )

    return AdminToken(token=create_access_token("admin", "admin"))
