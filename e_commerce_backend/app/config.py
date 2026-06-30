from __future__ import annotations

from functools import cached_property
from functools import lru_cache
import os
from pathlib import Path
from urllib.parse import quote

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "uploads"


class Settings(BaseSettings):
    project_name: str = "E-Commerce Review API"
    database_url: str | None = None
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    admin_username: str = "admin"
    admin_password: str = "admin123"
    jwt_secret: str = "change-this-review-dibo-jwt-secret"
    jwt_access_token_expire_minutes: int = 60 * 24

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @cached_property
    def resolved_database_url(self) -> str:
        database_url = _clean_env_value(self.database_url)
        if database_url:
            return database_url

        public_database_url = _clean_env_value(os.getenv("DATABASE_PUBLIC_URL"))
        if public_database_url:
            return public_database_url

        postgres_variables_url = _build_database_url_from_pg_vars()
        if postgres_variables_url:
            return postgres_variables_url

        local_database_url = "postgresql://postgres:your_password@localhost:5432/ecommerce_reviews"
        if os.getenv("RAILWAY_ENVIRONMENT") is None:
            return local_database_url

        raise RuntimeError(
            "Database connection settings are missing. In Railway, add DATABASE_URL to the "
            "backend service variables and reference the Postgres service DATABASE_URL without quotes."
        )


def _clean_env_value(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip().strip("\"'")
    return cleaned or None


def _build_database_url_from_pg_vars() -> str | None:
    user = _clean_env_value(os.getenv("PGUSER")) or _clean_env_value(os.getenv("POSTGRES_USER"))
    password = _clean_env_value(os.getenv("PGPASSWORD")) or _clean_env_value(
        os.getenv("POSTGRES_PASSWORD")
    )
    host = _clean_env_value(os.getenv("PGHOST"))
    port = _clean_env_value(os.getenv("PGPORT")) or "5432"
    database = _clean_env_value(os.getenv("PGDATABASE")) or _clean_env_value(
        os.getenv("POSTGRES_DB")
    )

    if not all([user, password, host, port, database]):
        return None

    return (
        f"postgresql://{quote(user)}:{quote(password)}@{host}:{port}/"
        f"{quote(database)}"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
