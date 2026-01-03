
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Upcycle API"
    API_V1_STR: str = "/api"
    
    # Database (loaded from .env)
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str = "changethis" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
