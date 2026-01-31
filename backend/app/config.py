from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/employee_portal"
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Email Service
    EMAIL_MOCK_MODE: bool = True
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@company.com"
    
    # OTP
    OTP_EXPIRATION_MINUTES: int = 10
    
    # Session Storage
    SESSION_STORAGE_TYPE: str = "memory"  # 'memory' or 'redis'
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads/certificates"
    MAX_FILE_SIZE_MB: int = 10
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # ChromaDB
    CHROMADB_PERSIST_DIR: str = "./chroma_db"
    CHROMADB_COLLECTION_HR: str = "hr_policies"
    CHROMADB_COLLECTION_IT: str = "it_policies"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
