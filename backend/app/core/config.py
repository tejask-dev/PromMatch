from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List, Union
from pydantic import field_validator
import json

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Prom Matchmaking API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str  # Used by backend for admin operations
    
    # Hugging Face
    HUGGINGFACE_API_KEY: str
    
    # CORS - handles JSON string from env or defaults to localhost
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]
    
    @field_validator('BACKEND_CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if not v or v.strip() == '':
                # Return default if empty string
                return [
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173"
                ]
            try:
                # Try to parse as JSON
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
                # If it's a single string, wrap in list
                return [parsed] if isinstance(parsed, str) else [str(parsed)]
            except (json.JSONDecodeError, ValueError):
                # If not valid JSON, treat as comma-separated string
                return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # JWT (Supabase uses its own JWT, but we verify it)
    JWT_SECRET: Optional[str] = None  # Will use Supabase JWT secret
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()