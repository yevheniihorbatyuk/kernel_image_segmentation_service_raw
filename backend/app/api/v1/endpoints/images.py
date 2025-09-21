# app/api/v1/endpoints/images.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import structlog

from app.services.image_service import ImageService
from app.schemas.image import ImageUploadResponse, ImageInfo, ImageListResponse
from app.config import settings

logger = structlog.get_logger()
router = APIRouter()

def get_image_service() -> ImageService:
    return ImageService()

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    image_service: ImageService = Depends(get_image_service)
):
    """Upload an image for segmentation."""
    
    # Validate file type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {settings.ALLOWED_FILE_TYPES}"
        )
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Upload image
    result = await image_service.upload_image(
        file_content=file_content,
        filename=file.filename,
        content_type=file.content_type
    )
    
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    
    logger.info(
        "Image uploaded",
        filename=file.filename,
        image_id=result.image.id if result.image else None,
        size=len(file_content)
    )
    
    return result

@router.get("/info/{image_id}")
async def get_image_info(
    image_id: str,
    image_service: ImageService = Depends(get_image_service)
):
    """Get information about an uploaded image."""
    
    image_url = await image_service.get_image_url(image_id)
    if not image_url:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Load image to get dimensions
    image_data = await image_service.get_image_data(image_id)
    if image_data is None:
        raise HTTPException(status_code=404, detail="Image data not found")
    
    return {
        "id": image_id,
        "url": image_url,
        "dimensions": image_data.shape[:2],
        "channels": image_data.shape[2] if len(image_data.shape) > 2 else 1
    }
