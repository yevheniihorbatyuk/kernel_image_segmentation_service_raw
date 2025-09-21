
# app/schemas/image.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import mimetypes

class ImageUploadRequest(BaseModel):
    filename: str
    content_type: str
    size: int
    
    @validator('content_type')
    def validate_content_type(cls, v):
        allowed_types = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff']
        if v not in allowed_types:
            raise ValueError(f'Content type must be one of: {allowed_types}')
        return v
    
    @validator('size')
    def validate_size(cls, v):
        max_size = 10 * 1024 * 1024  # 10MB
        if v > max_size:
            raise ValueError(f'File size must be less than {max_size} bytes')
        return v

class ImageInfo(BaseModel):
    id: str
    filename: str
    original_filename: str
    url: str
    content_type: str
    size: int
    dimensions: tuple[int, int]
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        use_enum_values = True

class ImageUploadResponse(BaseModel):
    success: bool
    image: Optional[ImageInfo] = None
    message: str
    upload_url: Optional[str] = None

class ImageListResponse(BaseModel):
    images: List[ImageInfo]
    total_count: int
    page: int
    page_size: int
