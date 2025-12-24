# Configuration settings for Healing Tracker AI Service

import os
from typing import List
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "Healing Tracker AI Service"
    API_VERSION: str = "2.0.0"
    API_DESCRIPTION: str = "Advanced AI-powered medical image analysis for wound healing assessment"
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
        env="ALLOWED_ORIGINS"
    )
    
    # ML Model Configuration
    MODEL_PATH: str = Field(default="./models", env="MODEL_PATH")
    DEVICE: str = Field(default="auto", env="DEVICE")  # auto, cpu, cuda
    BATCH_SIZE: int = Field(default=32, env="BATCH_SIZE")
    
    # Image Processing Configuration
    MAX_IMAGE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_IMAGE_SIZE")  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/png", "image/jpg", "image/bmp", "image/tiff"],
        env="ALLOWED_IMAGE_TYPES"
    )
    IMAGE_RESIZE_DIMS: tuple = (224, 224)
    
    # Database Configuration
    DATABASE_URL: str = Field(default="sqlite:///./healing_tracker.db", env="DATABASE_URL")
    
    # Redis Configuration (for caching)
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    
    # AWS S3 Configuration (for image storage)
    AWS_ACCESS_KEY_ID: str = Field(default="", env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    S3_BUCKET_NAME: str = Field(default="healing-tracker-images", env="S3_BUCKET_NAME")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="logs/healing_ai.log", env="LOG_FILE")
    
    # Security Configuration
    SECRET_KEY: str = Field(default="your-super-secret-key-change-in-production", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # AI Model Thresholds
    CONFIDENCE_THRESHOLD: float = Field(default=0.7, env="CONFIDENCE_THRESHOLD")
    HEALING_SCORE_THRESHOLD: float = Field(default=80.0, env="HEALING_SCORE_THRESHOLD")
    
    # Rate Limiting
    REQUESTS_PER_MINUTE: int = Field(default=60, env="REQUESTS_PER_MINUTE")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
















