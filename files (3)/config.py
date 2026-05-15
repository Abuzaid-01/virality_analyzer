from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Google Gemini API
    gemini_api_key: str
    gemini_api_key_fallback: str = ""

    # Groq API for content generation
    groq_api_key: str

    # Supabase
    supabase_url: str
    supabase_publishable_key: str
    supabase_service_role_key: str

    # Tavily (web search) - FREE tier available
    tavily_api_key: str = ""

    # App
    app_env: str = "development"
    app_port: int = 8000
    max_file_size_mb: int = 100
    allowed_video_types: str = "video/mp4,video/quicktime,video/webm,video/x-msvideo"
    allowed_image_types: str = "image/jpeg,image/png,image/webp,image/gif"
    cors_origins: str = "http://localhost:3000"

    @property
    def allowed_video_list(self) -> List[str]:
        return [t.strip() for t in self.allowed_video_types.split(",")]

    @property
    def allowed_image_list(self) -> List[str]:
        return [t.strip() for t in self.allowed_image_types.split(",")]

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
