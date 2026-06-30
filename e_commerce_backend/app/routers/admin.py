from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.jwt_auth import create_access_token
from app.schemas import AdminLogin, AdminToken


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=AdminToken)
def login(credentials: AdminLogin) -> AdminToken:
    settings = get_settings()
    if (
        credentials.username != settings.admin_username
        or credentials.password != settings.admin_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin username or password",
        )

    return AdminToken(token=create_access_token("admin", "admin"))
