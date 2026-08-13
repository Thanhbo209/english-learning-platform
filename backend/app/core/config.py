from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "EnglishEveryday API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/englisheveryday"
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    frontend_url: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
