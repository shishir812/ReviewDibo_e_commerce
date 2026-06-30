from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "uploads"


class Settings(BaseSettings):
    project_name: str = "E-Commerce Review API"
    database_url: str = "postgresql://postgres:your_password@localhost:5432/ecommerce_reviews"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    jwt_secret: str = "change-this-review-dibo-jwt-secret"
    jwt_access_token_expire_minutes: int = 60 * 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
