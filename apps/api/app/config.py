from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg://floraverse:devpassword@localhost:5433/floraverse"
    jwt_secret: str = "dev-only-secret-change-me-in-production-1234567890"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days

    app_origin: str = "http://localhost:5173"

    # AI plant identification / health assessment — https://plant.id (Kindwise).
    # Real feature, real API, but requires the user's own key: unset means the
    # /api/v1/ai/* endpoints respond with a clear "not configured" error rather
    # than ever fabricating a plausible-looking fake AI result.
    plant_id_api_key: str | None = None
    plant_id_base_url: str = "https://plant.id/api/v3"

    upload_dir: str = "uploads"
    max_upload_bytes: int = 8 * 1024 * 1024  # 8MB


settings = Settings()
