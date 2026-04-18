from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "recommendation-service"
    app_env: str = "development"
    api_prefix: str = "/recommend"
    default_limit: int = 10
    backend_api_url: str = "http://localhost:4000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
