from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(
        default="postgresql://peblo_user:peblo_password@localhost:5432/peblo_tv",
        validation_alias="DATABASE_URL",
    )
    jwt_secret: str = Field(
        default="change-me-in-production",
        validation_alias="JWT_SECRET",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    dev_admin_email: str = "admin@peblo.local"
    dev_admin_password: str = "admin-password"
    dev_editor_email: str = "editor@peblo.local"
    dev_editor_password: str = "editor-password"
    storage_backend: str = Field(default="local", validation_alias="STORAGE_BACKEND")
    local_storage_path: str = Field(
        default="/tmp/peblo_tv/storage",
        validation_alias="LOCAL_STORAGE_PATH",
    )
    catalogue_storage_path: str = Field(
        default="/tmp/peblo_tv/catalogue",
        validation_alias="CATALOGUE_STORAGE_PATH",
    )
    alert_webhook_url: str | None = Field(
        default=None,
        validation_alias="ALERT_WEBHOOK_URL",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
