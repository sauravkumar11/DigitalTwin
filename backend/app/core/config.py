"""
Application configuration, loaded from environment variables (.env).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TwinCare AI"
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Security / JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # Database
    DATABASE_URL: str = (
        "postgresql://twincare:twincare@localhost:5432/twincare"
    )

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Uploads
    UPLOAD_DIR: str = "uploads"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
