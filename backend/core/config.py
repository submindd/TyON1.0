from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Firecrawl
    FIRECRAWL_API_KEY: str

    # DeepSeek
    DEEPSEEK_API_KEY: str

    # MySQL
    MYSQL_URL: str

    # Redis
    REDIS_URL: str


settings = Settings()  # type: ignore[call-arg]
