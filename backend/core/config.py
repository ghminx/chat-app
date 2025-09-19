# backend/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    FRONTEND_URL: str

    class Config:
        env_file = ".env"
        extra = "allow"   # 추가 환경변수 있으면 무시하지 않고 허용

settings = Settings()
