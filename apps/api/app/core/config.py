from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings read from `.env` and environment variables."""

    # PostgreSQL
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/peblo_tv",
        validation_alias="DATABASE_URL",
    )
    jwt_secret: str = Field(
        default="",
        validation_alias="JWT_SECRET",
    )

    # Storage
    storage_backend: str = Field(default="local", validation_alias="STORAGE_BACKEND")
    local_storage_path: str = Field(
        default="/tmp/peblo_tv/storage",
        validation_alias="LOCAL_STORAGE_PATH",
    )
    catalogue_storage_path: str = Field(
        default="/tmp/peblo_tv/catalogue",
        validation_alias="CATALOGUE_STORAGE_PATH",
    )

    # Alerts
    alert_webhook_url: str | None = Field(
        default=None,
        validation_alias="ALERT_WEBHOOK_URL",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
