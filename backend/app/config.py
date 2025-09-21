# app/config.py
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Image Segmentation Service"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Database
    DATABASE_URL: str = "postgresql://segmentation_user:segmentation_pass@postgres:5432/segmentation_db"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    REDIS_CACHE_TTL: int = 3600  # 1 hour
    
    # File Upload
    UPLOAD_PATH: str = "/app/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/bmp", "image/tiff"]
    
    # ML Configuration
    MAX_IMAGE_DIMENSION: int = 2048
    DEFAULT_RESIZE_DIMENSION: int = 512
    
    # Performance
    MAX_CONCURRENT_SEGMENTATIONS: int = 4
    SEGMENTATION_TIMEOUT: int = 60  # seconds
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# ML Algorithm Configurations
class AlgorithmConfig:
    FELZENSZWALB = {
        "name": "felzenszwalb",
        "display_name": "Felzenszwalb",
        "default_params": {
            "scale": 100,
            "sigma": 0.5,
            "min_size": 50
        },
        "param_ranges": {
            "scale": (10, 1000),
            "sigma": (0.1, 2.0),
            "min_size": (10, 500)
        }
    }
    
    SLIC = {
        "name": "slic",
        "display_name": "SLIC",
        "default_params": {
            "n_segments": 250,
            "compactness": 10,
            "sigma": 1,
            "start_label": 1
        },
        "param_ranges": {
            "n_segments": (50, 1000),
            "compactness": (1, 50),
            "sigma": (0, 5),
            "start_label": (0, 1)
        }
    }
    
    QUICKSHIFT = {
        "name": "quickshift",
        "display_name": "Quickshift",
        "default_params": {
            "kernel_size": 3,
            "max_dist": 6,
            "ratio": 0.5
        },
        "param_ranges": {
            "kernel_size": (1, 10),
            "max_dist": (1, 20),
            "ratio": (0.1, 1.0)
        }
    }
    
    WATERSHED = {
        "name": "watershed",
        "display_name": "Watershed",
        "default_params": {
            "markers": 250,
            "compactness": 0
        },
        "param_ranges": {
            "markers": (50, 1000),
            "compactness": (0, 1)
        }
    }

# Available algorithms mapping
AVAILABLE_ALGORITHMS = {
    "felzenszwalb": AlgorithmConfig.FELZENSZWALB,
    "slic": AlgorithmConfig.SLIC,
    "quickshift": AlgorithmConfig.QUICKSHIFT,
    "watershed": AlgorithmConfig.WATERSHED
}